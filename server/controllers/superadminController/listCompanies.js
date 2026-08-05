const Company = require("../../models/Company");
const User = require("../../models/User");

exports.listCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ createdAt: -1 });

    const counts = await User.aggregate([
      { $match: { companyId: { $ne: null } } },
      { $group: { _id: "$companyId", total: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => (countMap[c._id] = c.total));

    res.json({
      companies: companies.map((c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        status: c.status,
        totalEmployees: c.totalEmployees,
        timezone: c.timezone,
        members: countMap[c._id] || 0,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error listing companies:", error.message);
    res.status(500).json({ message: "Failed to list companies" });
  }
};
