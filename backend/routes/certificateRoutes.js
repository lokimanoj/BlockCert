
const express = require("express");
const router = express.Router();

const {
  issueCertificate,
  getInstitutionCertificates,
  verifyCertificate,
  revokeCertificate,
} = require("../controllers/certificateController");

const {
  getInstitutionTransactionHistory,
} = require("../controllers/transactionController");

const {
  protect,
  institutionOnly,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

// Issue a certificate
router.post(
  "/issue",
  protect,
  institutionOnly,
  upload.single("certificate"),
  issueCertificate
);

// Get institution certificates
router.get(
  "/institution",
  protect,
  institutionOnly,
  getInstitutionCertificates
);

// Get institution blockchain transaction history
router.get(
  "/institution/transactions",
  protect,
  institutionOnly,
  getInstitutionTransactionHistory
);

// Revoke a certificate
router.put(
  "/revoke",
  protect,
  institutionOnly,
  revokeCertificate
);

// Public certificate verification
router.post(
  "/verify",
  upload.single("certificate"),
  verifyCertificate
);

module.exports = router;
