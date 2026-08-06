const User = require("../../models/User");
const {
  createUserWithSetupToken,
  setupLinkFor,
} = require("../../common/onboarding");
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

    const { user, setupToken } = await createUserWithSetupToken({
      firstName,
      lastName,
      email,
      phone: "",
      salary: 0,
      address: "",
      role: "superadmin",
    });

    const link = setupLinkFor(setupToken);
    let emailFailed = false;
    try {
      await sendSetupLinkEmail(email, `${firstName} ${lastName}`, link);
    } catch (error) {
      console.error("Failed to send setup email:", error.message);
      emailFailed = true;
    }

    res.status(201).json({
      message: emailFailed
        ? "Invitation created, but the setup email could not be sent."
        : "Invitation sent",
      emailFailed,
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
