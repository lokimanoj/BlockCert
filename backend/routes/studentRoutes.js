
const express = require("express");
const router = express.Router();

const {
  getInstitutionStudents,
  getApprovedInstitutions,
} = require("../controllers/studentController");

const {
  protect,
  institutionOnly,
} = require("../middleware/authMiddleware");

// Public API for student registration
router.get("/approved-institutions", getApprovedInstitutions);

// Institution-only student list
router.get(
  "/institution",
  protect,
  institutionOnly,
  getInstitutionStudents
);

module.exports = router;
