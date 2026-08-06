const mongoose = require("mongoose");
const Company = require("../../models/Company");

// Soft-delete a company. Data (users/attendance) is preserved so a misclick
// cannot permanently destroy payroll history. Deleted companies are excluded
// from listings and blocked from auth/check-in.
exports.deleteCompany = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid company id" });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: "deleted" },
      { new: true }
    );
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({
      message: "Company marked as deleted",
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
        status: company.status,
      },
    });
  } catch (error) {
    console.error("Error deleting company:", error.message);
    res.status(500).json({ message: "Failed to delete company" });
  }
};
