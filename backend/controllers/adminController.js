const Institution = require("../models/Institution");
const User = require("../models/User");
const Certificate = require("../models/Certificate");

// Get all institutions
exports.getAllInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: institutions.length,
      institutions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch institutions",
      error: error.message,
    });
  }
};

// Get pending institutions
exports.getPendingInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find({
      isApproved: false,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: institutions.length,
      institutions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch pending institutions",
      error: error.message,
    });
  }
};

// Approve institution
exports.approveInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const institution = await Institution.findById(institutionId);

    if (!institution) {
      return res.status(404).json({
        message: "Institution not found",
      });
    }

    institution.isApproved = true;
    institution.isActive = true;
    institution.rejectionReason = "";

    await institution.save();

    await User.findOneAndUpdate(
      {
        institution: institution._id,
        role: "institution",
      },
      { isActive: true }
    );

    return res.status(200).json({
      message: "Institution approved successfully",
      institution,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Institution approval failed",
      error: error.message,
    });
  }
};

// Reject institution
exports.rejectInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        message: "Please provide a rejection reason",
      });
    }

    const institution = await Institution.findById(institutionId);

    if (!institution) {
      return res.status(404).json({
        message: "Institution not found",
      });
    }

    if (institution.isApproved) {
      return res.status(400).json({
        message: "Approved institutions cannot be rejected directly",
      });
    }

    institution.isApproved = false;
    institution.isActive = false;
    institution.rejectionReason = rejectionReason.trim();

    await institution.save();

    await User.findOneAndUpdate(
      {
        institution: institution._id,
        role: "institution",
      },
      { isActive: false }
    );

    return res.status(200).json({
      message: "Institution rejected successfully",
      rejectionReason: institution.rejectionReason,
      institution,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Institution rejection failed",
      error: error.message,
    });
  }
};

// Activate or deactivate an approved institution
exports.toggleInstitutionStatus = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "Please provide isActive as true or false",
      });
    }

    const institution = await Institution.findById(institutionId);

    if (!institution) {
      return res.status(404).json({
        message: "Institution not found",
      });
    }

    if (!institution.isApproved) {
      return res.status(400).json({
        message:
          "Only approved institutions can be activated or deactivated",
      });
    }

    institution.isActive = isActive;
    await institution.save();

    await User.findOneAndUpdate(
      {
        institution: institution._id,
        role: "institution",
      },
      { isActive }
    );

    return res.status(200).json({
      message: isActive
        ? "Institution activated successfully"
        : "Institution deactivated successfully",
      institution,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Institution status update failed",
      error: error.message,
    });
  }
};

// Get all certificates for System Admin
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("student")
      .populate("institution")
      .populate("blockchainTransaction")
      .sort({ createdAt: -1 })
      .lean();

    const total = certificates.length;

    const issued = certificates.filter(
      (certificate) => certificate.status === "Issued"
    ).length;

    const revoked = certificates.filter(
      (certificate) => certificate.status === "Revoked"
    ).length;

    const expired = certificates.filter(
      (certificate) =>
        certificate.status === "Issued" &&
        certificate.expiryDate &&
        new Date(certificate.expiryDate) < new Date()
    ).length;

    return res.status(200).json({
      success: true,
      count: total,
      statistics: {
        total,
        issued,
        revoked,
        expired,
      },
      certificates,
    });
  } catch (error) {
    console.error("Admin certificate retrieval error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
      error: error.message,
    });
  }
};