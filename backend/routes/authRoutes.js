
const express = require("express");
const router = express.Router();

const {
  registerInstitution,
  registerStudent,
  login,
} = require("../controllers/authController");

// Institution registration
router.post("/register/institution", registerInstitution);

// Student registration
router.post("/register/student", registerStudent);

// Login for both roles
router.post("/login", login);

module.exports = router;
