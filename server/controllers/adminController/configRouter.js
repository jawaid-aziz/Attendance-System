const Company = require("../../models/Company");
const { getCompany } = require("../../common/getCompany");

// API Handlers
const getAllowedIPs = async (req, res) => {
  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }
    res.json({ allowedIPs: company.allowedRouterIPs });
  } catch (error) {
    console.error("Error fetching allowed IPs:", error.message);
    res.status(500).json({ message: "Failed to fetch allowed IPs" });
  }
};

const addAllowedIP = async (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({ message: "IP address is required" });
  }

  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

  if (!ipRegex.test(ip)) {
    return res.status(400).json({ message: "Invalid IP address format" });
  }

  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    if (company.allowedRouterIPs.includes(ip)) {
      return res.status(400).json({ message: "IP address already exists" });
    }

    company.allowedRouterIPs.push(ip);
    await company.save();

    res.json({ message: "IP added successfully", allowedIPs: company.allowedRouterIPs });
  } catch (error) {
    console.error("Error adding allowed IP:", error.message);
    res.status(500).json({ message: "Failed to add allowed IP" });
  }
};

const removeAllowedIP = async (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({ message: "IP address is required" });
  }

  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    company.allowedRouterIPs = company.allowedRouterIPs.filter(
      (item) => item !== ip
    );
    await company.save();

    res.json({ message: "IP removed successfully", allowedIPs: company.allowedRouterIPs });
  } catch (error) {
    console.error("Error removing allowed IP:", error.message);
    res.status(500).json({ message: "Failed to remove allowed IP" });
  }
};

module.exports = { getAllowedIPs, addAllowedIP, removeAllowedIP };
