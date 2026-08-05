const Company = require("../models/Company");

// Resolve the company a request operates on:
// - Company admins / employees: from their JWT companyId
// - Superadmins: from the ?companyId= query param (for cross-tenant management)
const getCompany = async (req) => {
  const companyId = req.user?.companyId || req.query.companyId;
  if (!companyId) return null;
  const company = await Company.findById(companyId);
  return company || null;
};

module.exports = { getCompany };
