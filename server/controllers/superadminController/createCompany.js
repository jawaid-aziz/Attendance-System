const crypto = require("crypto");
const Company = require("../../models/Company");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { slugify } = require("../../common/slugify");
const { sendSetupLinkEmail } = require("../../utils/sendMail");

exports.createCompany = async (req, res) => {
  try {
    const {
      name,
      slug,
      totalEmployees,
      timezone,
      adminFirstName,
      adminLastName,
      adminEmail,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Company name is required" });
    }

    // Validate the admin email BEFORE creating the company so a duplicate
    // email cannot leave an orphaned company behind.
    if (adminEmail) {
      const existing = await User.findOne({ email: adminEmail });
      if (existing) {
        return res.status(400).json({ message: "Admin email already in use" });
      }
    }

    let companySlug = slugify(slug || name);
    if (!companySlug) {
      return res.status(400).json({ message: "Invalid company slug" });
    }

    // Ensure slug uniqueness
    let uniqueSlug = companySlug;
    let counter = 2;
    while (await Company.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${companySlug}-${counter++}`;
    }

    const company = await Company.create({
      name,
      slug: uniqueSlug,
      totalEmployees: totalEmployees || 0,
      timezone: timezone || "Asia/Karachi",
      createdBy: req.user.id,
    });

    // Company admins are activated via an emailed one-time setup link,
    // matching the self-serve onboarding and superadmin invite flows.
    let admin = null;
    let setupLink = null;
    if (adminEmail && adminFirstName) {

      const token = crypto.randomBytes(32).toString("hex");
      admin = await User.create({
        firstName: adminFirstName,
        lastName: adminLastName || adminFirstName,
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

      setupLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/setup/${token}`;
      await sendSetupLinkEmail(
        adminEmail,
        `${admin.firstName} ${admin.lastName}`,
        setupLink
      );
      console.log(`Setup link generated for ${adminEmail}: ${setupLink}`);
    }

    res.status(201).json({
      message: "Company created successfully",
      company: {
        _id: company._id,
        name: company.name,
        slug: company.slug,
        status: company.status,
        timezone: company.timezone,
      },
      admin: admin
        ? {
            id: admin._id,
            email: admin.email,
            role: admin.role,
            setupLink,
          }
        : null,
    });
  } catch (error) {
    console.error("Error creating company:", error.message);
    res.status(500).json({ message: "Failed to create company" });
  }
};
