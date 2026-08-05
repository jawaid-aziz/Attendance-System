const os = require("os");
const User = require("../models/User");
const Company = require("../models/Company");

const validateOfficeIP = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.employeeId);
    if (!employee || !employee.companyId) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const company = await Company.findById(employee.companyId);
    const allowedRouterIPs = company ? company.allowedRouterIPs : [];

    let gatewayIP = null;
    const interfaces = os.networkInterfaces();

    for (const name in interfaces) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          gatewayIP = iface.address;
          break;
        }
      }
      if (gatewayIP) break;
    }

    console.log("Detected Router Gateway IP:", gatewayIP);

    if (!gatewayIP) {
      return res
        .status(403)
        .json({ message: "Unable to detect active Wi-Fi network." });
    }

    // Validate against the company's allowed router IPs
    if (!allowedRouterIPs.includes(gatewayIP)) {
      return res
        .status(403)
        .json({ message: "Access denied: Not connected to the allowed router." });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error validating office IP:", error.message);
    return res.status(500).json({ message: "Failed to validate office IP." });
  }
};

module.exports = validateOfficeIP;
