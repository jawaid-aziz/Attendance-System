const Company = require("../models/Company");

// Resolve the requesting user's company (set by the authorizeCompany
// middleware). Returns the Company document, or null if there is no
// company context (e.g. superadmin).
exports.getCompany = async (req) => {
  if (req.company) return req.company;
  if (!req.user || !req.user.companyId) return null;
  return Company.findById(req.user.companyId);
};

// Fetch a company by its slug for the logged-in member (or superadmin).
// Used by the client to personalize the dashboard (branding/name).
exports.getCompanyBySlug = async (req, res) => {
  const { slug } = req.params;
  if (!slug) {
    return res.status(400).json({ message: "Slug is required" });
  }

  try {
    const company = await Company.findOne({ slug });
    if (!company || company.status === "deleted") {
      return res.status(404).json({ message: "Company not found" });
    }

    const isSuperadmin = req.user.role === "superadmin";
    const isMember =
      req.user.companyId &&
      req.user.companyId.toString() === company._id.toString();

    if (!isSuperadmin && !isMember) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json({
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
        timezone: company.timezone,
        status: company.status,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch company", error: error.message });
  }
};
