const mongoose = require("mongoose");
const Company = require("../../models/Company");
const User = require("../../models/User");

exports.getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Company id or slug is required" });
    }

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const company = await Company.findOne(query);
    if (!company || company.status === "deleted") {
      return res.status(404).json({ message: "Company not found" });
    }

    const users = await User.find({ companyId: company._id }).select(
      "firstName lastName email phone role companyId createdAt"
    );

    res.json({ company, users });
  } catch (error) {
    console.error("Error fetching company details:", error.message);
    res.status(500).json({ message: "Failed to fetch company details" });
  }
};
