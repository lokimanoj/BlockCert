
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token is required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive || user.role !== decoded.role) {
      return res.status(401).json({
        message: "Invalid or inactive account",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
};

// System Admin access
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "System Admin access required",
  });
};

// Institution access
exports.institutionOnly = (req, res, next) => {
  if (req.user && req.user.role === "institution") {
    return next();
  }

  return res.status(403).json({
    message: "Institution access required",
  });
};

// Student access
exports.studentOnly = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    return next();
  }

  return res.status(403).json({
    message: "Student access required",
  });
};
