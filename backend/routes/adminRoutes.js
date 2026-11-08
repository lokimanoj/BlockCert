const express = require("express");
const router = express.Router();

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getAllInstitutions,
  getPendingInstitutions,
  approveInstitution,
  rejectInstitution,
  toggleInstitutionStatus,
  getAllCertificates,
} = require("../controllers/adminController");

const {
  getAllTransactionHistory,
} = require("../controllers/transactionController");

// All routes require System Admin authentication
router.use(protect, adminOnly);

// Institution routes
router.get("/institutions", getAllInstitutions);

router.get("/institutions/pending", getPendingInstitutions);

router.put(
  "/institutions/:institutionId/approve",
  approveInstitution
);

router.put(
  "/institutions/:institutionId/reject",
  rejectInstitution
);

router.put(
  "/institutions/:institutionId/status",
  toggleInstitutionStatus
);

// Blockchain records
router.get(
  "/blockchain-transactions",
  getAllTransactionHistory
);

// Certificate management
router.get(
  "/certificates",
  getAllCertificates
);

module.exports = router;