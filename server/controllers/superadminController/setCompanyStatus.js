const mongoose = require("mongoose");
const Company = require("../../models/Company");

exports.setCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid company id" });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.status = status;
    await company.save();

    res.json({
      message: `Company ${status}`,
      company: {
        _id: company._id,
        name: company.name,
        slug: company.slug,
        status: company.status,
      },
    });
  } catch (error) {
    console.error("Error updating company status:", error.message);
    res.status(500).json({ message: "Failed to update company status" });
  }
};
