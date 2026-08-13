const User = require("../models/User");
const Company = require("../models/Company");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generateToken } = require("../utils/tokenUtils");
const { serializeUser } = require("../common/getUser");
const { isStrongPassword } = require("../common/password");
const {
  createCompanyWithUniqueSlug,
  createUserWithSetupToken,
  setupLinkFor,
} = require("../common/onboarding");
const { sendSetupLinkEmail, sendPasswordResetEmail } = require("../utils/sendMail");
const { withTransaction } = require("../utils/withTransaction");
const { isValidTimezone } = require("../common/validation");
const logger = require("../utils/logger");

// Reset links must be single-use; an hour is enough for a password reset.
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

// Fixed bcrypt hash of a random throwaway password. Compared against when the
// email is unknown so login responses take the same time for existing and
// non-existing accounts (prevents timing-based account enumeration).
const DUMMY_HASH =
  "$2a$10$yhqAjbwIhjN6MN2QRgfw/e8gzIt6f5ZRafWUppzJnZQasFSbUoe8G";

// User Login
exports.loginUser = async (req, res) => {
  const { email, password, slug } = req.body;

  // Manual validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  if (!password || !isStrongPassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters with a letter and a number" });
  }

  try {
    // Check if the user exists with the given email
    const user = await User.findOne({ email });
    // Generic message to avoid user enumeration
    if (!user) {
      // Equalize timing: run bcrypt against a dummy hash so unknown-email
      // responses take about as long as a real password comparison.
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Fetch the user's company once and reuse it for the tenant-slug check,
    // the status check, and the response slug.
    const company = user.companyId
      ? await Company.findById(user.companyId)
      : null;

    // If a tenant slug was provided, verify the user belongs to that company
    if (slug) {
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      if (company.slug !== slug) {
        return res
          .status(403)
          .json({ message: "This account does not belong to this company" });
      }
    }

    // Block login if the user's company is suspended or deleted
    if (company && ["suspended", "deleted"].includes(company.status)) {
      return res
        .status(403)
        .json({ message: "Your company account is not active." });
    }

    const token = generateToken(user, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      slug: company ? company.slug : null,
      user: serializeUser(user),
    });
  } catch (error) {
    logger.error("Error logging in:", error.message);
    res.status(500).json({ message: "Failed to login" });
  }
};

// Company registration (tenant onboarding) — creates the company and an
// admin account that must be activated via the emailed setup link.
exports.registerCompany = async (req, res) => {
  const {
    companyName,
    totalEmployees,
    timezone,
    adminFirstName,
    adminLastName,
    adminEmail,
  } = req.body;

  if (!companyName || !companyName.trim()) {
    return res.status(400).json({ message: "Company name is required" });
  }
  if (!adminFirstName || !adminFirstName.trim()) {
    return res.status(400).json({ message: "Admin first name is required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!adminEmail || !emailRegex.test(adminEmail)) {
    return res.status(400).json({ message: "Invalid admin email address" });
  }
  if (timezone && !isValidTimezone(timezone)) {
    return res
      .status(400)
      .json({ message: "Invalid timezone. Use a valid IANA zone, e.g. Asia/Karachi." });
  }

  try {
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Company + admin must be created atomically (no orphaned tenants).
    const { company, admin, setupToken } = await withTransaction(
      async (session) => {
        const company = await createCompanyWithUniqueSlug(
          {
            name: companyName.trim(),
            totalEmployees:
              Number(totalEmployees) > 0 ? Number(totalEmployees) : 0,
            timezone: timezone || "Asia/Karachi",
            status: "active",
          },
          session
        );
        const { user: admin, setupToken } = await createUserWithSetupToken(
          {
            firstName: adminFirstName.trim(),
            lastName: (adminLastName || "").trim() || adminFirstName.trim(),
            email: adminEmail,
            phone: "",
            salary: 0,
            address: "",
            role: "admin",
            companyId: company._id,
          },
          session
        );
        return { company, admin, setupToken };
      }
    );

    const link = setupLinkFor(setupToken);
    let emailFailed = false;
    try {
      await sendSetupLinkEmail(adminEmail, `${admin.firstName} ${admin.lastName}`, link);
    } catch (error) {
      logger.error("Failed to send setup email:", error.message);
      emailFailed = true;
    }

    res.status(201).json({
      message: emailFailed
        ? "Account created, but the setup email could not be sent."
        : "Account created! Check your email for a link to set your password.",
      emailFailed,
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
      },
      admin: {
        id: admin._id,
        email: admin.email,
        ...(emailFailed ? { setupLink: link } : {}),
      },
    });
  } catch (error) {
    logger.error("Error registering company:", error.message);
    res.status(500).json({ message: "Failed to create account" });
  }
};

// Change the authenticated user's password (works for every role).
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ message: "Current password is required" });
  }
  if (!isStrongPassword(newPassword)) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters with a letter and a number" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.version = (user.version || 0) + 1; // revoke other sessions
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error("Error changing password:", error.message);
    res.status(500).json({ message: "Failed to update password" });
  }
};

// Complete account setup from the one-time emailed link
exports.completeSetup = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Setup token is required" });
  }
  if (!isStrongPassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters with a letter and a number" });
  }

  try {
    const user = await User.findOne({ setupToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid or expired setup link" });
    }
    if (user.setupTokenExpires && user.setupTokenExpires < new Date()) {
      return res.status(400).json({ message: "Setup link has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.setupToken = null;
    user.setupTokenExpires = null;
    user.version = (user.version || 0) + 1;
    await user.save();

    const jwtToken = generateToken(user, user.role);

    let slug = null;
    if (user.companyId) {
      const company = await Company.findById(user.companyId);
      slug = company ? company.slug : null;
    }

    res.status(200).json({
      message: "Password set successfully",
      token: jwtToken,
      slug,
      user: serializeUser(user),
    });
  } catch (error) {
    logger.error("Error completing setup:", error.message);
    res.status(500).json({ message: "Failed to set password" });
  }
};

// Request a one-time password-reset link by email. Always responds the same
// way whether or not the email exists so the endpoint cannot be used to
// enumerate registered accounts.
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetToken = resetToken;
      user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset/${resetToken}`;
      try {
        await sendPasswordResetEmail(
          user.email,
          `${user.firstName} ${user.lastName}`.trim(),
          link
        );
      } catch (error) {
        logger.error("Failed to send password reset email:", error.message);
      }
    }

    res.status(200).json({
      message: "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error) {
    logger.error("Error requesting password reset:", error.message);
    res.status(500).json({ message: "Failed to request password reset" });
  }
};

// Complete a password reset using the one-time emailed link.
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Reset token is required" });
  }
  if (!isStrongPassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters with a letter and a number" });
  }

  try {
    const user = await User.findOne({ resetToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid or expired reset link" });
    }
    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      return res.status(400).json({ message: "Reset link has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    user.version = (user.version || 0) + 1;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    logger.error("Error resetting password:", error.message);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
