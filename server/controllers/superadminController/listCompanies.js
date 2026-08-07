const Company = require("../../models/Company");
const User = require("../../models/User");
const logger = require("../../utils/logger");

exports.listCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ status: { $ne: "deleted" } }).sort({
      createdAt: -1,
    });

    // Count only the users belonging to the companies being returned. $in is
    // index-served, unlike a $ne: null scan over the whole collection.
    const companyIds = companies.map((c) => c._id);
    const [counts, admins] =
      companyIds.length > 0
        ? await Promise.all([
            User.aggregate([
              { $match: { companyId: { $in: companyIds } } },
              { $group: { _id: "$companyId", total: { $sum: 1 } } },
            ]),
            // Primary admin per company (first admin created for that tenant).
            User.aggregate([
              { $match: { companyId: { $in: companyIds }, role: "admin" } },
              { $sort: { createdAt: 1 } },
              {
                $group: {
                  _id: "$companyId",
                  adminName: { $first: { $concat: ["$firstName", " ", "$lastName"] } },
                  adminEmail: { $first: "$email" },
                },
              },
            ]),
          ])
        : [[], []];
    const countMap = {};
    counts.forEach((c) => (countMap[c._id] = c.total));
    const adminMap = {};
    admins.forEach((a) => (adminMap[a._id] = a));

    res.json({
      companies: companies.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        status: c.status,
        totalEmployees: c.totalEmployees,
        timezone: c.timezone,
        members: countMap[c._id] || 0,
        adminName: adminMap[c._id]?.adminName || "—",
        adminEmail: adminMap[c._id]?.adminEmail || "",
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    logger.error("Error listing companies:", error.message);
    res.status(500).json({ message: "Failed to list companies" });
  }
};
