
const mongoose = require("mongoose");

const blockchainTransactionSchema = new mongoose.Schema(
  {
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      default: null,
    },

    certificateId: {
      type: String,
      required: true,
    },

    documentHash: {
      type: String,
      required: true,
    },

    blockNumber: {
      type: Number,
      default: null,
    },

    walletAddress: {
      type: String,
      default: "",
    },

    contractAddress: {
      type: String,
      default: "",
    },

    network: {
      type: String,
      default: "Localhost",
    },

    transactionType: {
      type: String,
      enum: ["ISSUE", "REVOKE", "VERIFY"],
      required: true,
    },

    transactionStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "BlockchainTransaction",
  blockchainTransactionSchema
);
