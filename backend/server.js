
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const studentCertificateRoutes = require("./routes/studentCertificateRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded PDF files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/student", studentCertificateRoutes);
app.use("/api/admin", adminRoutes);

// Backend test route
app.get("/", (req, res) => {
  res.json({
    message: "BlockCert Backend is Running Successfully!",
    status: "Connected",
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("-----------------------------------");
      console.log("BlockCert Backend Started");
      console.log("-----------------------------------");
      console.log(`Server: http://localhost:${PORT}`);
      console.log("MongoDB: Connected Successfully");
      console.log("Authentication API: /api/auth");
      console.log("Student API: /api/students");
      console.log("Certificate API: /api/certificates");
      console.log("Admin API: /api/admin");
      console.log("-----------------------------------");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
