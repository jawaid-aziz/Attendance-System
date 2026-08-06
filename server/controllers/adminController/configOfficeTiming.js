const Company = require("../../models/Company");
const { getCompany } = require("../../common/getCompany");

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
    console.error("Error fetching office schedule:", error.message);
    res.status(500).json({ message: "Failed to fetch office schedule." });
  }
};

// Save office schedule for the requesting company
const saveOfficeSchedule = async (req, res) => {
  const { schedule } = req.body;

  if (!schedule || typeof schedule !== "object") {
    return res.status(400).json({ message: "Invalid schedule data." });
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
    console.error("Error saving office schedule:", error);
    res.status(500).json({ message: "Failed to save office schedule." });
  }
};

module.exports = { getOfficeSchedule, saveOfficeSchedule };
