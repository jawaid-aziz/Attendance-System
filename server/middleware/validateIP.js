const os = require("os");

const validateOfficeIP = (req, res, next) => {
  const allowedRouterIPs = (process.env.ALLOWED_ROUTER_IPS || "").split(",");

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

  // Validate against allowed router IPs
  if (!allowedRouterIPs.includes(gatewayIP)) {
    return res
      .status(403)
      .json({ message: "Access denied: Not connected to the allowed router." });
  }

  next(); // Proceed to the next middleware or route handler
};

module.exports = validateOfficeIP;
