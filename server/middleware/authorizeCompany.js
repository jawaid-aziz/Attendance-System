const Company = require("../models/Company");
const logger = require("../utils/logger");

// Ensures the authenticated user has a valid company context.
// - Superadmins pass through (they manage tenants via ?companyId=)
// - Company admins/employees must belong to an active company
const authorizeCompany = async (req, res, next) => {
  try {
    if (req.user.role === "superadmin") {
      return next();
    }

    const companyId = req.user.companyId;
    if (!companyId) {
      return res
        .status(403)
        .json({ message: "Forbidden: No company context." });
    }

    const company = await Company.findById(companyId);
    if (!company || ["suspended", "deleted"].includes(company.status)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Company is not active." });
    }

    req.company = company;
    next();
  } catch (error) {
    logger.error("Error in authorizeCompany:", error.message);
    return res.status(500).json({ message: "Failed to authorize company." });
  }
};

module.exports = authorizeCompany;
