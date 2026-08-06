const crypto = require("crypto");
const User = require("../models/User");
const Company = require("../models/Company");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/tokenUtils");
const { slugify } = require("../common/slugify");
const { sendSetupLinkEmail } = require("../utils/sendMail");

// At least 8 characters, with at least one letter and one number.
const isStrongPassword = (password) => {
  if (!password || typeof password !== "string") return false;
  if (password.length < 8) return false;
  return /[A-Za-z]/.test(password) && /\d/.test(password);
};

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
    // Check if the user exists with the given email and role
    const user = await User.findOne({ email });
    // Generic message to avoid user enumeration
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If a tenant slug was provided, verify the user belongs to that company
    if (slug) {
      const company = await Company.findOne({ slug });
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      if (!user.companyId || user.companyId.toString() !== company._id.toString()) {
        return res
          .status(403)
          .json({ message: "This account does not belong to this company" });
      }
    }

    // Block login if the user's company is suspended or deleted
    if (user.companyId) {
      const company = await Company.findById(user.companyId);
      if (
        company &&
        ["suspended", "deleted"].includes(company.status)
      ) {
        return res
          .status(403)
          .json({ message: "Your company account is not active." });
      }
    }

    const token = generateToken(user, user.role);

    // Resolve the company slug for tenant URLs
    let slugForUser = null;
    if (user.companyId) {
      const company = await Company.findById(user.companyId);
      slugForUser = company ? company.slug : null;
    }

    res.status(200).json({
      message: "Login successful",
      token,
      slug: slugForUser,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        salary: user.salary,
        address: user.address,
        companyId: user.companyId || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

// Company registration (tenant onboarding) — creates the company and an
// admin account that must be activated via the emailed setup link
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

  try {
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Ensure the slug is unique
    const baseSlug = slugify(companyName) || "company";
    let slug = baseSlug;
    let counter = 2;
    while (await Company.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const company = await Company.create({
      name: companyName.trim(),
      slug,
      totalEmployees: Number(totalEmployees) > 0 ? Number(totalEmployees) : 0,
      timezone: timezone || "Asia/Karachi",
      status: "active",
    });

    const token = crypto.randomBytes(32).toString("hex");
    const admin = await User.create({
      firstName: adminFirstName.trim(),
      lastName: (adminLastName || "").trim() || adminFirstName.trim(),
      email: adminEmail,
      phone: "",
      salary: 0,
      address: "",
      password: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10),
      role: "admin",
      companyId: company._id,
      setupToken: token,
      setupTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/setup/${token}`;
    await sendSetupLinkEmail(adminEmail, `${admin.firstName} ${admin.lastName}`, link);

    res.status(201).json({
      message:
        "Account created! Check your email for a link to set your password.",
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
      },
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error registering company:", error.message);
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
    console.error("Error changing password:", error.message);
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
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        salary: user.salary,
        address: user.address,
        companyId: user.companyId || null,
      },
    });
  } catch (error) {
    console.error("Error completing setup:", error.message);
    res.status(500).json({ message: "Failed to set password" });
  }
};
