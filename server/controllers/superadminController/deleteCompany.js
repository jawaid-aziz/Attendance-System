const mongoose = require("mongoose");
const Company = require("../../models/Company");
const User = require("../../models/User");
const Attendance = require("../../models/Attendance");

exports.deleteCompany = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid company id" });
    }

    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const userResult = await User.deleteMany({ companyId: company._id });
    const attendanceResult = await Attendance.deleteMany({ companyId: company._id });

    res.json({
      message: "Company and related data deleted",
      usersDeleted: userResult.deletedCount,
      attendanceDeleted: attendanceResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting company:", error.message);
    res.status(500).json({ message: "Failed to delete company" });
  }
};
