
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

const User = require("../models/User");

// Load backend .env file
dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

const createAdmin = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/blockcert";

    const adminName = process.env.ADMIN_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminName || !adminEmail || !adminPassword) {
      throw new Error(
        "Please configure ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env"
      );
    }

    if (adminPassword.length < 8) {
      throw new Error("Admin password must contain at least 8 characters");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const normalizedEmail = adminEmail.toLowerCase().trim();

    const existingAdmin = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    });

    if (existingAdmin) {
      console.log("System Admin account already exists.");
      return;
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      throw new Error(
        "This email already belongs to another account. Use a different admin email."
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await User.create({
      name: adminName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("--------------------------------");
    console.log("System Admin created successfully!");
    console.log("Admin Email:", normalizedEmail);
    console.log("--------------------------------");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
