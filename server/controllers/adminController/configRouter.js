const fs = require("fs");
const path = require("path");

// Path to .env file
const ENV_FILE_PATH = path.resolve(__dirname, "../../.env");

// Helper to read/write .env file
const updateEnvFile = (key, value) => {
  const envData = fs.readFileSync(ENV_FILE_PATH, "utf8");
  const envVars = envData.split("\n").filter((line) => line.trim());

  const newEnvVars = envVars.map((line) => {
    if (line.startsWith(`${key}=`)) {
      return `${key}=${value}`;
    }
    return line;
  });

  // If key not found, append it
  if (!newEnvVars.some((line) => line.startsWith(`${key}=`))) {
    newEnvVars.push(`${key}=${value}`);
  }

  fs.writeFileSync(ENV_FILE_PATH, newEnvVars.join("\n"), "utf8");
};

// API Handlers
const getAllowedIPs = (req, res) => {
  const allowedIPs = process.env.ALLOWED_ROUTER_IPS || "";
  res.json({ allowedIPs: allowedIPs.split(",").filter(Boolean) });
};

const addAllowedIP = (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({ message: "IP address is required" });
  }

  // Ensure IP is valid
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

  if (!ipRegex.test(ip)) {
    return res.status(400).json({ message: "Invalid IP address format" });
  }

  const currentIPs = (process.env.ALLOWED_ROUTER_IPS || "")
    .split(",")
    .filter((ip) => ip.trim() !== ""); // Remove empty strings

  if (currentIPs.includes(ip)) {
    return res.status(400).json({ message: "IP address already exists" });
  }

  currentIPs.push(ip);
  updateEnvFile("ALLOWED_ROUTER_IPS", currentIPs.join(","));
  process.env.ALLOWED_ROUTER_IPS = currentIPs.join(",");

  res.json({ message: "IP added successfully", allowedIPs: currentIPs });
};

const removeAllowedIP = (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({ message: "IP address is required" });
  }

  const currentIPs = (process.env.ALLOWED_ROUTER_IPS || "").split(",");
  const updatedIPs = currentIPs.filter((item) => item !== ip);

  updateEnvFile("ALLOWED_ROUTER_IPS", updatedIPs.join(","));
  process.env.ALLOWED_ROUTER_IPS = updatedIPs.join(",");

  res.json({ message: "IP removed successfully", allowedIPs: updatedIPs });
};

module.exports = { getAllowedIPs, addAllowedIP, removeAllowedIP };
