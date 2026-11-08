const express = require("express");
const router = express.Router();

const {
  getMyCertificates,
} = require("../controllers/studentCertificateController");

const {
  protect,
  studentOnly,
} = require("../middleware/authMiddleware");

router.get(
  "/my-certificates",
  protect,
  studentOnly,
  getMyCertificates
);

module.exports = router;