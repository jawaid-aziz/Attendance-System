const { networkInterfaces } = require("os");

const validateOfficeIP = (req, res, next) => {
  const allowedRouterIPs = (process.env.ALLOWED_ROUTER_IPS || "").split(",");

  // Get network interfaces
  const interfaces = networkInterfaces();
  let gatewayIP = "";

  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (
        iface.family === "IPv4" && // Check only IPv4
        !iface.internal && // Ignore internal/localhost addresses
        iface.netmask === "255.255.255.0" && // Match standard subnet mask
        iface.address.startsWith("192.168.100") // Focus on specific subnet
      ) {
        gatewayIP = iface.address;
        break;
      }
    }
    if (gatewayIP) break; // Stop searching once a valid gateway is found
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
