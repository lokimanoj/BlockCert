
const crypto = require("crypto");
const fs = require("fs");

const Certificate = require("../models/Certificate");
const Student = require("../models/Student");
const BlockchainTransaction = require("../models/BlockchainTransaction");

const {
  registerCertificate,
  verifyCertificate: verifyOnBlockchain,
  revokeCertificate: revokeOnBlockchain,
} = require("../services/blockchainService");

// HELPER: DELETE TEMPORARY UPLOADED FILE
const deleteUploadedFile = (file) => {
  if (file && file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

// ISSUE CERTIFICATE
exports.issueCertificate = async (req, res) => {
  let certificate = null;

  try {
    const {
      studentId,
      certificateTitle,
      course,
      department,
      issueDate,
      expiryDate,
    } = req.body;

    if (
      !studentId ||
      !certificateTitle ||
      !course ||
      !department ||
      !req.file
    ) {
      deleteUploadedFile(req.file);

      return res.status(400).json({
        message: "Please provide all required details and a PDF file.",
      });
    }

    const student = await Student.findOne({
      _id: studentId,
      institution: req.user.institution,
      isActive: true,
    });

    if (!student) {
      deleteUploadedFile(req.file);

      return res.status(404).json({
        message: "Active student not found in your institution.",
      });
    }

    const documentBuffer = fs.readFileSync(req.file.path);

    const documentHash = crypto
      .createHash("sha256")
      .update(documentBuffer)
      .digest("hex");

    const existingCertificate = await Certificate.findOne({
      documentHash,
    });

    if (existingCertificate) {
      deleteUploadedFile(req.file);

      return res.status(409).json({
        message: "This exact PDF has already been registered.",
      });
    }

    const certificateId = `BC-${crypto.randomUUID()}`;

    // STEP 1: CREATE THE MONGODB CERTIFICATE RECORD
    certificate = await Certificate.create({
      certificateId,
      student: student._id,
      institution: req.user.institution,
      certificateTitle,
      course,
      department,
      issueDate: issueDate || new Date(),
      expiryDate: expiryDate || null,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      documentHash,
      qrCodeData: certificateId,
      status: "Issued",
      issuedBy: req.user._id,
    });

    // STEP 2: REGISTER CERTIFICATE ON BLOCKCHAIN
    let blockchainResult;

    try {
      blockchainResult = await registerCertificate(
        certificateId,
        documentHash
      );
    } catch (blockchainError) {
      // Remove the MongoDB record if blockchain registration fails.
      await Certificate.deleteOne({ _id: certificate._id });
      certificate = null;

      throw new Error(
        `Blockchain registration failed: ${blockchainError.message}`
      );
    }

    // STEP 3: SAVE BLOCKCHAIN TRANSACTION IN MONGODB
    const transaction = await BlockchainTransaction.create({
      transactionHash: blockchainResult.transactionHash,
      certificate: certificate._id,
      certificateId,
      documentHash,
      blockNumber: blockchainResult.blockNumber,
      walletAddress: blockchainResult.walletAddress,
      contractAddress: blockchainResult.contractAddress,
      network: "Localhost",
      transactionType: "ISSUE",
      transactionStatus: "SUCCESS",
    });

    // STEP 4: LINK TRANSACTION TO CERTIFICATE
    certificate.blockchainTransaction = transaction._id;
    await certificate.save();

    return res.status(201).json({
      message: "Certificate issued and registered on blockchain successfully.",
      certificate,
      blockchain: {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        walletAddress: blockchainResult.walletAddress,
        contractAddress: blockchainResult.contractAddress,
      },
    });
  } catch (error) {
    // Keep the uploaded PDF if its certificate was already registered.
    if (!certificate) {
      deleteUploadedFile(req.file);
    }

    console.error("Certificate issuance error:", error);

    return res.status(500).json({
      message: "Unable to complete certificate issuance.",
      error: error.message,
    });
  }
};

// GET ALL CERTIFICATES FOR THE LOGGED-IN INSTITUTION
exports.getInstitutionCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      institution: req.user.institution,
    })
      .populate(
        "student",
        "studentName registerNumber email department course"
      )
      .populate("blockchainTransaction")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Certificates fetched successfully.",
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Fetch certificates error:", error);

    return res.status(500).json({
      message: "Unable to fetch certificates.",
      error: error.message,
    });
  }
};

// REVOKE CERTIFICATE
exports.revokeCertificate = async (req, res) => {
  try {
    const { certificateId, revocationReason } = req.body;

    if (!certificateId || !revocationReason || !revocationReason.trim()) {
      return res.status(400).json({
        message: "Certificate ID and revocation reason are required.",
      });
    }

    const certificate = await Certificate.findOne({
      certificateId: certificateId.trim(),
      institution: req.user.institution,
    });

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found in your institution.",
      });
    }

    if (certificate.status === "Revoked") {
      return res.status(409).json({
        message: "This certificate has already been revoked.",
      });
    }

    if (certificate.status !== "Issued") {
      return res.status(400).json({
        message: "Only issued certificates can be revoked.",
      });
    }

    // STEP 1: CHECK THE BLOCKCHAIN RECORD
    const blockchainState = await verifyOnBlockchain(
      certificate.certificateId,
      certificate.documentHash
    );

    if (!blockchainState.exists || !blockchainState.authentic) {
      return res.status(409).json({
        message: "Certificate does not have a valid blockchain record.",
      });
    }

    // Handle a blockchain revocation that may have succeeded
    // even if an earlier MongoDB update failed.
    if (blockchainState.revoked) {
      certificate.status = "Revoked";
      certificate.revokedAt = new Date();
      certificate.revocationReason = revocationReason.trim();

      await certificate.save();

      return res.status(200).json({
        message: "Blockchain revocation synchronized with the database.",
        certificate,
      });
    }

    // STEP 2: REVOKE ON BLOCKCHAIN
    const blockchainResult = await revokeOnBlockchain(
      certificate.certificateId
    );

    // STEP 3: SAVE THE BLOCKCHAIN TRANSACTION
    const transaction = await BlockchainTransaction.create({
      transactionHash: blockchainResult.transactionHash,
      certificate: certificate._id,
      certificateId: certificate.certificateId,
      documentHash: certificate.documentHash,
      blockNumber: blockchainResult.blockNumber,
      walletAddress: blockchainResult.walletAddress,
      contractAddress: blockchainResult.contractAddress,
      network: "Localhost",
      transactionType: "REVOKE",
      transactionStatus: "SUCCESS",
    });

    // STEP 4: UPDATE MONGODB CERTIFICATE STATUS
    certificate.status = "Revoked";
    certificate.revokedAt = new Date();
    certificate.revocationReason = revocationReason.trim();
    certificate.blockchainTransaction = transaction._id;

    await certificate.save();

    return res.status(200).json({
      message: "Certificate revoked on blockchain successfully.",
      certificate,
      blockchain: {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        walletAddress: blockchainResult.walletAddress,
        contractAddress: blockchainResult.contractAddress,
      },
    });
  } catch (error) {
    console.error("Certificate revocation error:", error);

    return res.status(500).json({
      message: "Unable to revoke certificate.",
      error: error.message,
    });
  }
};

// VERIFY CERTIFICATE

// VERIFY CERTIFICATE
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.body;

    if (!certificateId) {
      deleteUploadedFile(req.file);

      return res.status(400).json({
        status: "INVALID_REQUEST",
        message: "Certificate ID is required.",
      });
    }

    // Find certificate in MongoDB
    const certificate = await Certificate.findOne({
      certificateId: certificateId.trim(),
    }).populate(
      "student",
      "studentName registerNumber department course"
    );

    if (!certificate) {
      deleteUploadedFile(req.file);

      return res.status(404).json({
        status: "NOT_FOUND",
        message: "Certificate not found.",
      });
    }

    // STEP 1: CHECK UPLOADED PDF HASH FIRST
    if (req.file) {
      const documentBuffer = fs.readFileSync(req.file.path);

      const uploadedHash = crypto
        .createHash("sha256")
        .update(documentBuffer)
        .digest("hex");

      deleteUploadedFile(req.file);

      if (
        uploadedHash.toLowerCase() !==
        certificate.documentHash.toLowerCase()
      ) {
        return res.status(200).json({
          status: "TAMPERED",
          message: "The uploaded PDF does not match the original certificate.",
          certificate,
        });
      }
    }

    // STEP 2: VERIFY ON BLOCKCHAIN
    const blockchainResult = await verifyOnBlockchain(
      certificate.certificateId,
      certificate.documentHash
    );

    if (!blockchainResult.exists) {
      return res.status(200).json({
        status: "NOT_ON_BLOCKCHAIN",
        message: "Certificate has no matching blockchain registration.",
        certificate,
      });
    }

    // STEP 3: CHECK BLOCKCHAIN AUTHENTICITY
    if (!blockchainResult.authentic && !blockchainResult.revoked) {
      return res.status(200).json({
        status: "BLOCKCHAIN_MISMATCH",
        message: "Certificate details do not match the blockchain record.",
        certificate,
        blockchain: blockchainResult,
      });
    }

    // STEP 4: CHECK REVOCATION
    if (
      blockchainResult.revoked ||
      certificate.status === "Revoked"
    ) {
      return res.status(200).json({
        status: "REVOKED",
        message: "This certificate has been revoked.",
        certificate,
        blockchain: blockchainResult,
      });
    }

    // STEP 5: AUTHENTIC CERTIFICATE
    return res.status(200).json({
      status: "AUTHENTIC",
      message: "Certificate is authentic and verified on blockchain.",
      certificate,
      blockchain: blockchainResult,
    });

  } catch (error) {
    deleteUploadedFile(req.file);

    console.error("Certificate verification error:", error);

    return res.status(500).json({
      message: "Unable to verify certificate.",
      error: error.message,
    });
  }
};
