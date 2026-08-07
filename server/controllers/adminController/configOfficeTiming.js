const { getCompany } = require("../../common/getCompany");
const { isValidOfficeSchedule } = require("../../common/validation");
const logger = require("../../utils/logger");

// Get office schedule for the requesting company
const getOfficeSchedule = async (req, res) => {
  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }
    res.json({
      schedule: company.officeSchedule || {},
      timezone: company.timezone || "Asia/Karachi",
    });
  } catch (error) {
    logger.error("Error fetching office schedule:", error.message);
    res.status(500).json({ message: "Failed to fetch office schedule." });
  }
};

// Save office schedule for the requesting company
const saveOfficeSchedule = async (req, res) => {
  const { schedule } = req.body;

  if (!isValidOfficeSchedule(schedule)) {
    return res.status(400).json({
      message:
        "Invalid schedule data. Each day must have isOpen (boolean) and, when open, startTime/endTime in HH:mm format.",
    });
  }

  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    company.officeSchedule = schedule;
    await company.save();

    res.json({ message: "Office schedule updated successfully." });
  } catch (error) {
    logger.error("Error saving office schedule:", error);
    res.status(500).json({ message: "Failed to save office schedule." });
  }
};

module.exports = { getOfficeSchedule, saveOfficeSchedule };
