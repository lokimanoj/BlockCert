
const User = require("../models/User");
const Institution = require("../models/Institution");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Register institution account
exports.registerInstitution = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      institutionName,
      institutionCode,
      phone,
      address,
    } = req.body;

    if (
      !name || !email || !password || !institutionName ||
      !institutionCode || !phone || !address
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    const existingInstitution = await Institution.findOne({
      $or: [
        { email: normalizedEmail },
        { institutionCode: institutionCode.toUpperCase() },
      ],
    });

    if (existingUser || existingInstitution) {
      return res.status(409).json({
        message: "Email or institution code already exists",
      });
    }

    const institution = await Institution.create({
      institutionName,
      institutionCode,
      email: normalizedEmail,
      phone,
      address,
      isApproved: false,
    });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "institution",
      institution: institution._id,
    });

    res.status(201).json({
      message: "Institution registered. Awaiting approval.",
      institutionId: institution._id,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Institution registration failed",
      error: error.message,
    });
  }
};

// Student registration
exports.registerStudent = async (req, res) => {
  try {
    const {
      studentName,
      registerNumber,
      email,
      phone,
      department,
      course,
      batch,
      institutionId,
      password,
    } = req.body;

    if (
      !studentName || !registerNumber || !email || !department ||
      !course || !batch || !institutionId || !password
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const institution = await Institution.findOne({
      _id: institutionId,
      isApproved: true,
      isActive: true,
    });

    if (!institution) {
      return res.status(400).json({
        message: "Institution not found or not approved",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    const existingStudent = await Student.findOne({
      registerNumber: registerNumber.toUpperCase(),
    });

    if (existingUser || existingStudent) {
      return res.status(409).json({
        message: "Email or register number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: studentName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
    });

    const student = await Student.create({
      studentName,
      registerNumber,
      email: normalizedEmail,
      phone,
      department,
      course,
      batch,
      institution: institution._id,
      user: user._id,
    });

    user.student = student._id;
    await user.save();

    res.status(201).json({
      message: "Student registered successfully",
      studentId: student._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Student registration failed",
      error: error.message,
    });
  }
};

// Login for System Admin, Institution and Student
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password and role are required",
      });
    }

    if (!["admin", "institution", "student"].includes(role)) {
      return res.status(400).json({
        message: "Invalid login role",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      role,
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Institution approval check
    if (role === "institution") {
      const institution = await Institution.findById(
        user.institution
      );

      if (
        !institution ||
        !institution.isApproved ||
        !institution.isActive
      ) {
        return res.status(403).json({
          message: "Institution account is awaiting approval or inactive",
        });
      }
    }

    // Admin accounts are created securely through the
    // backend setup process, not through public registration.

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
