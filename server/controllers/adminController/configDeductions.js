const { getCompany } = require("../../common/getCompany");
const { getDeductionConfig, DEFAULT_CONFIG } = require("../../common/deductions");
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
      deductionConfig: getDeductionConfig(company),
    });
  } catch (error) {
    logger.error("Error fetching deductions settings:", error.message);
    res.status(500).json({ message: "Failed to fetch deductions settings" });
  }
};

const RATE_FIELDS = ["lateCheckInRate", "noCheckOutRate", "absentRate"];
const GRACE_FIELDS = ["lateGraceMinutes", "noCheckOutGraceHours"];

/**
 * @desc    Update deductions settings for the requesting company
 * @route   POST /admin/updateDeductions
 * @access  Admin
 */
exports.updateDeductions = async (req, res) => {
  const { deductionsEnabled, deductionConfig } = req.body;

  if (typeof deductionsEnabled !== "boolean") {
    return res
      .status(400)
      .json({ message: "deductionsEnabled must be a boolean." });
  }

  const config = { ...DEFAULT_CONFIG, ...(deductionConfig || {}) };

  for (const field of RATE_FIELDS) {
    const value = config[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return res.status(400).json({ message: `${field} must be a number.` });
    }
    if (value < 0 || value > 100) {
      return res
        .status(400)
        .json({ message: `${field} must be between 0 and 100.` });
    }
  }

  for (const field of GRACE_FIELDS) {
    const value = config[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return res.status(400).json({ message: `${field} must be a number.` });
    }
    if (value < 0) {
      return res
        .status(400)
        .json({ message: `${field} must be a non-negative number.` });
    }
  }

  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    company.deductionEnabled = deductionsEnabled;
    company.deductionConfig = config;
    await company.save();

    res.status(200).json({ message: "Deductions settings updated successfully." });
  } catch (error) {
    logger.error("Error updating deductions settings:", error.message);
    res.status(500).json({ message: "Failed to update deductions settings" });
  }
};
