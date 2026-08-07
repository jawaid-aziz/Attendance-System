require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Company = require("../models/Company");
const logger = require("../utils/logger");

const seed = async () => {
  try {
    // Refuse to run in production: the seed promotes users to superadmin and
    // reassigns companyless users, which is destructive to real data.
    if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOWED !== "true") {
      logger.error(
        "Refusing to seed: NODE_ENV=production. Set SEED_ALLOWED=true to override."
      );
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URL);
    logger.info("Connected:", mongoose.connection.db.databaseName);

    // 1. Default / owner company seeded with current .env config
    let company = await Company.findOne({ slug: "ontime" });
    if (!company) {
      company = await Company.create({
        name: "OnTime",
        slug: "ontime",
        totalEmployees: 10,
        timezone: process.env.TIMEZONE || "Asia/Karachi",
        officeSchedule: JSON.parse(process.env.OFFICE_SCHEDULE || "{}"),
        deductionEnabled: process.env.DEDUCTIONS_ENABLED === "true",
        deductionRate: parseFloat(process.env.DEDUCTION_RATE) || 0,
        allowedRouterIPs: (process.env.ALLOWED_ROUTER_IPS || "")
          .split(",")
          .filter(Boolean),
      });
      logger.info("Created default company:", company.slug);
    } else {
      logger.info("Default company exists:", company.slug);
    }

    // 2. Promote the owner to superadmin (platform-level, no company)
    const ownerEmail = process.env.USER_EMAIL;
    let owner = ownerEmail ? await User.findOne({ email: ownerEmail }) : null;
    if (!owner) {
      owner = await User.findOne({ role: "admin" });
    }
    if (owner) {
      owner.role = "superadmin";
      owner.companyId = null;
      await owner.save();
      logger.info("Superadmin set:", owner.email);
    } else {
      logger.warn("No owner user found to promote.");
    }

    // 3. Assign any remaining users (without a company) to the default company
    const result = await User.updateMany(
      {
        _id: { $ne: owner ? owner._id : null },
        $or: [{ companyId: null }, { companyId: { $exists: false } }],
      },
      { $set: { companyId: company._id } }
    );
    logger.info("Users assigned to OnTime:", result.modifiedCount);

    // 4. Demo users so the tenant flow is testable end to end
    const demoAdmin = await User.findOne({ email: "demo.admin@ontime.com" });
    if (!demoAdmin) {
      await User.create({
        firstName: "Demo",
        lastName: "Admin",
        email: "demo.admin@ontime.com",
        phone: "03001234567",
        salary: 100000,
        address: "Demo Address",
        password: await bcrypt.hash("demo12345", 10),
        role: "admin",
        companyId: company._id,
      });
      logger.info("Created demo admin");
    }

    const demoEmployee = await User.findOne({ email: "demo.emp@ontime.com" });
    if (!demoEmployee) {
      await User.create({
        firstName: "Demo",
        lastName: "Employee",
        email: "demo.emp@ontime.com",
        phone: "03007654321",
        salary: 50000,
        address: "Demo Address",
        password: await bcrypt.hash("demo12345", 10),
        role: "employee",
        companyId: company._id,
      });
      logger.info("Created demo employee");
    }

    await mongoose.disconnect();
    logger.info("Seed complete.");
  } catch (err) {
    logger.error("Seed error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
