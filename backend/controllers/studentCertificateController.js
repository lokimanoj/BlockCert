
const Student = require("../models/Student");
const Certificate = require("../models/Certificate");

exports.getMyCertificates = async (req, res) => {
  try {
    // Find the active student linked to the logged-in user
    const student = await Student.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found.",
      });
    }

    // Fetch only this student's certificates
    const certificates = await Certificate.find({
      student: student._id,
    })
      .populate(
        "student",
        "studentName registerNumber email department course"
      )
      .populate(
        "institution",
        "institutionName institutionCode"
      )
      .populate("blockchainTransaction")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Student certificates fetched successfully.",
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Student certificates error:", error);

    return res.status(500).json({
      message: "Unable to fetch student certificates.",
      error: error.message,
    });
  }
};
