const net = require("net");
const Company = require("../../models/Company");
const { getCompany } = require("../../common/getCompany");
const logger = require("../../utils/logger");

const normalizeIP = (ip) => (typeof ip === "string" ? ip.trim() : "");

// API Handlers
const getAllowedIPs = async (req, res) => {
  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }
    res.json({ allowedIPs: company.allowedRouterIPs });
  } catch (error) {
    logger.error("Error fetching allowed IPs:", error.message);
    res.status(500).json({ message: "Failed to fetch allowed IPs" });
  }
};

const addAllowedIP = async (req, res) => {
  const ip = normalizeIP(req.body.ip);
  if (!ip) {
    return res.status(400).json({ message: "IP address is required" });
  }
  // Supports both IPv4 and IPv6.
  if (net.isIP(ip) === 0) {
    return res.status(400).json({ message: "Invalid IP address format" });
  }

  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    const allowed = Array.isArray(company.allowedRouterIPs)
      ? company.allowedRouterIPs.map(normalizeIP)
      : [];
    if (allowed.includes(ip)) {
      return res.status(400).json({ message: "IP address already exists" });
    }

    allowed.push(ip);
    company.allowedRouterIPs = allowed;
    await company.save();

    res.json({ message: "IP added successfully", allowedIPs: company.allowedRouterIPs });
  } catch (error) {
    logger.error("Error adding allowed IP:", error.message);
    res.status(500).json({ message: "Failed to add allowed IP" });
  }
};

const removeAllowedIP = async (req, res) => {
  const ip = normalizeIP(req.body.ip);
  if (!ip) {
    return res.status(400).json({ message: "IP address is required" });
  }
  if (net.isIP(ip) === 0) {
    return res.status(400).json({ message: "Invalid IP address format" });
  }

  try {
    const company = await getCompany(req);
    if (!company) {
      return res.status(400).json({ message: "No company context." });
    }

    company.allowedRouterIPs = (Array.isArray(company.allowedRouterIPs)
      ? company.allowedRouterIPs
      : []
    ).filter((item) => normalizeIP(item) !== ip);
    await company.save();

    res.json({ message: "IP removed successfully", allowedIPs: company.allowedRouterIPs });
  } catch (error) {
    logger.error("Error removing allowed IP:", error.message);
    res.status(500).json({ message: "Failed to remove allowed IP" });
  }
};

module.exports = { getAllowedIPs, addAllowedIP, removeAllowedIP };
