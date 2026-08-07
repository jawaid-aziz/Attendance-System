const User = require("../../models/User");
const logger = require("../../utils/logger");

exports.listSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await User.find({ role: "superadmin" }).select(
      "firstName lastName email createdAt"
    );
    res.json({ superAdmins });
  } catch (error) {
    logger.error("Error listing superadmins:", error.message);
    res.status(500).json({ message: "Failed to list superadmins" });
  }
};
