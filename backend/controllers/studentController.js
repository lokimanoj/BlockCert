
const Student = require("../models/Student");
const Institution = require("../models/Institution");

// Get students belonging to the logged-in institution
exports.getInstitutionStudents = async (req, res) => {
  try {
    const institutionId = req.user.institution;

    if (!institutionId) {
      return res.status(403).json({
        message: "Institution account not found",
      });
    }

    const students = await Student.find({
      institution: institutionId,
      isActive: true,
    })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Students fetched successfully",
      totalStudents: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

// Get approved institutions for student registration
exports.getApprovedInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find({
      isApproved: true,
      isActive: true,
    }).select("institutionName institutionCode");

    res.status(200).json({
      message: "Approved institutions fetched successfully",
      institutions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch institutions",
      error: error.message,
    });
  }
};
