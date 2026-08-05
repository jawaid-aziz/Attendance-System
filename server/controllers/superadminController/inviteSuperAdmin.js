const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const { sendSetupLinkEmail } = require("../../utils/sendMail");

exports.inviteSuperAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return res
        .status(400)
        .json({ message: "First name, last name and email are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone: "",
      salary: 0,
      address: "",
      password: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10),
      role: "superadmin",
      setupToken: token,
      setupTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/setup/${token}`;
    await sendSetupLinkEmail(email, `${firstName} ${lastName}`, link);
    console.log(`Setup link generated for ${email}: ${link}`);

    res.status(201).json({
      message: "Invitation sent",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error inviting superadmin:", error.message);
    res.status(500).json({ message: "Failed to invite superadmin" });
  }
};
