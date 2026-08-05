const mongoose = require("mongoose");
const Company = require("../../models/Company");
const User = require("../../models/User");

exports.getCompanyDetails = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid company id" });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const users = await User.find({ companyId: company._id }).select(
      "firstName lastName email phone role salary companyId createdAt"
    );

    res.json({ company, users });
  } catch (error) {
    console.error("Error fetching company details:", error.message);
    res.status(500).json({ message: "Failed to fetch company details" });
  }
};
