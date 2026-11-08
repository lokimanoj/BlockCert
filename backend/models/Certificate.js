
const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    certificateTitle: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      default: "",
    },

    documentHash: {
      type: String,
      required: true,
      unique: true,
    },

    qrCodeData: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Issued", "Revoked"],
      default: "Issued",
    },

    blockchainTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlockchainTransaction",
      default: null,
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    revocationReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
