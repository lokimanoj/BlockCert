
const Certificate = require("../models/Certificate");
const BlockchainTransaction = require("../models/BlockchainTransaction");

// Get transaction history for the logged-in institution
exports.getInstitutionTransactionHistory = async (req, res) => {
  try {
    // Find certificates issued by this institution
    const certificates = await Certificate.find({
      issuedBy: req.user._id,
    }).select("certificateId");

    const certificateIds = certificates.map(
      (certificate) => certificate.certificateId
    );

    // Return an empty list if no certificates exist
    if (certificateIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        transactions: [],
      });
    }

    // Find all transactions belonging to those certificates
    const transactions = await BlockchainTransaction.find({
      certificateId: { $in: certificateIds },
    })
      .sort({ timestamp: -1, createdAt: -1 })
      .populate({
        path: "certificate",
        select: "certificateId status course department issueDate",
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Institution transaction history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve institution transaction history.",
    });
  }
};

// Get all blockchain transactions for the system admin
exports.getAllTransactionHistory = async (req, res) => {
  try {
    const transactions = await BlockchainTransaction.find({})
      .sort({ timestamp: -1, createdAt: -1 })
      .populate({
        path: "certificate",
        select: "certificateId status course department issueDate",
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Admin transaction history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve blockchain transaction history.",
    });
  }
};
