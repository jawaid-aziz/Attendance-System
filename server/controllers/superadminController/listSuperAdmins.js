const User = require("../../models/User");

exports.listSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await User.find({ role: "superadmin" }).select(
      "firstName lastName email createdAt"
    );
    res.json({ superAdmins });
  } catch (error) {
    console.error("Error listing superadmins:", error.message);
    res.status(500).json({ message: "Failed to list superadmins" });
  }
};
