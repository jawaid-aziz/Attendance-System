const Company = require("../../models/Company");
const { getCompany } = require("../../common/getCompany");
const logger = require("../../utils/logger");

/**
 * @desc    Get the deductions settings for the requesting company
 * @route   GET /admin/getDeductions
 * @access  Admin
 */
exports.getDeductions = async (req, res) => {
  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    res.status(200).json({
      deductionsEnabled: company.deductionEnabled,
      deductionRate: company.deductionRate,
    });
  } catch (error) {
    logger.error("Error fetching deductions settings:", error.message);
    res.status(500).json({ message: "Failed to fetch deductions settings" });
  }
};

/**
 * @desc    Update deductions settings for the requesting company
 * @route   POST /admin/updateDeductions
 * @access  Admin
 */
exports.updateDeductions = async (req, res) => {
  const { deductionsEnabled, deductionRate } = req.body;

  if (typeof deductionsEnabled !== "boolean" || typeof deductionRate !== "number") {
    return res
      .status(400)
      .json({ message: "Invalid data types for deductionsEnabled or deductionRate." });
  }
  if (deductionRate < 0 || deductionRate > 100) {
    return res
      .status(400)
      .json({ message: "deductionRate must be between 0 and 100." });
  }

  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    company.deductionEnabled = deductionsEnabled;
    company.deductionRate = deductionRate;
    await company.save();

    res.status(200).json({ message: "Deductions settings updated successfully." });
  } catch (error) {
    logger.error("Error updating deductions settings:", error.message);
    res.status(500).json({ message: "Failed to update deductions settings" });
  }
};
