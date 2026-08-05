const Company = require("../../models/Company");
const { getCompany } = require("../../common/getCompany");

/**
 * @desc    Get the current timezone for the requesting company
 * @route   GET /admin/getTime
 * @access  Admin
 */
exports.getTimezone = async (req, res) => {
  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }
    res.status(200).json({ timezone: company.timezone });
  } catch (error) {
    console.error("Error retrieving timezone:", error.message);
    res
      .status(500)
      .json({ message: "Failed to retrieve timezone", error: error.message });
  }
};

/**
 * @desc    Update the timezone for the requesting company
 * @route   POST /admin/updateTime
 * @access  Admin
 */
exports.updateTimezone = async (req, res) => {
  const { timezone } = req.body;

  if (!timezone) {
    return res.status(400).json({ message: "Timezone is required." });
  }

  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    company.timezone = timezone;
    await company.save();

    res
      .status(200)
      .json({ message: "Timezone updated successfully.", timezone });
    console.log(
      `Timezone updated for company ${company.slug} to: ${timezone}`
    );
  } catch (error) {
    console.error("Error updating timezone:", error.message);
    res
      .status(500)
      .json({ message: "Failed to update timezone", error: error.message });
  }
};
