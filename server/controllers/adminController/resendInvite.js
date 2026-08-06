const crypto = require("crypto");
const User = require("../../models/User");
const { setupLinkFor } = require("../../common/onboarding");
const { sendSetupLinkEmail } = require("../../utils/sendMail");

// Regenerate and re-email a one-time setup link for a user who never set
// their password (e.g. the original invite email failed or expired).
exports.resendInvite = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Company admins can only resend invites within their own company.
    if (
      req.user.role !== "superadmin" &&
      req.user.companyId &&
      user.companyId &&
      req.user.companyId.toString() !== user.companyId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot resend invites outside your company" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.setupToken = token;
    user.setupTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const link = setupLinkFor(token);
    let emailFailed = false;
    try {
      await sendSetupLinkEmail(user.email, `${user.firstName} ${user.lastName}`, link);
    } catch (error) {
      console.error("Failed to resend setup email:", error.message);
      emailFailed = true;
    }

    res.status(200).json({
      message: emailFailed
        ? "Setup link regenerated, but the email could not be sent."
        : "Setup link re-sent.",
      emailFailed,
    });
  } catch (error) {
    console.error("Error resending invite:", error.message);
    res.status(500).json({ message: "Failed to resend invite" });
  }
};
