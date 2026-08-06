const Company = require("../../models/Company");
const User = require("../../models/User");
const { isValidTimezone } = require("../../common/validation");
const {
  createCompanyWithUniqueSlug,
  createUserWithSetupToken,
  setupLinkFor,
} = require("../../common/onboarding");
const { sendSetupLinkEmail } = require("../../utils/sendMail");
const { withTransaction } = require("../../utils/withTransaction");

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
    // Admin details must be provided together (or not at all).
    if ((adminEmail && !adminFirstName) || (!adminEmail && adminFirstName)) {
      return res.status(400).json({
        message: "adminEmail and adminFirstName must be provided together",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (adminEmail && !emailRegex.test(adminEmail)) {
      return res.status(400).json({ message: "Invalid admin email address" });
    }
    if (timezone && !isValidTimezone(timezone)) {
      return res
        .status(400)
        .json({ message: "Invalid timezone. Use a valid IANA zone, e.g. Asia/Karachi." });
    }

    // Company + optional admin created atomically (no orphaned tenants).
    const { company, admin, setupToken } = await withTransaction(async (session) => {
      const company = await createCompanyWithUniqueSlug(
        {
          name,
          slug: slug || name,
          totalEmployees: Number(totalEmployees) > 0 ? Number(totalEmployees) : 0,
          timezone: timezone || "Asia/Karachi",
          createdBy: req.user.id,
        },
        session
      );

      if (!adminEmail) return { company, admin: null, setupToken: null };

      // Company admins are activated via an emailed one-time setup link,
      // matching the self-serve onboarding and superadmin invite flows.
      const { user: admin, setupToken } = await createUserWithSetupToken(
        {
          firstName: adminFirstName,
          lastName: adminLastName || adminFirstName,
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
    });

    let setupLink = null;
    let emailFailed = false;
    if (setupToken) {
      setupLink = setupLinkFor(setupToken);
      try {
        await sendSetupLinkEmail(
          adminEmail,
          `${admin.firstName} ${admin.lastName}`,
          setupLink
        );
      } catch (error) {
        console.error("Failed to send setup email:", error.message);
        emailFailed = true;
      }
    }

    res.status(201).json({
      message: emailFailed
        ? "Company created successfully, but the admin setup email could not be sent."
        : "Company created successfully",
      emailFailed,
      company: {
        id: company._id,
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
            ...(setupLink ? { setupLink } : {}),
          }
        : null,
    });
  } catch (error) {
    console.error("Error creating company:", error.message);
    res.status(500).json({ message: "Failed to create company" });
  }
};
