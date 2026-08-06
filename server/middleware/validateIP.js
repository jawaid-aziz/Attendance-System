const Company = require("../models/Company");

// Resolve the caller's IP, honoring reverse proxies (the app must run with
// `app.set("trust proxy", 1)` for this to be reliable).
const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = String(forwarded).split(",")[0].trim();
    if (first) return first;
  }
  const remote = req.socket && req.socket.remoteAddress;
  return remote ? remote.replace("::ffff:", "") : null;
};

// Verify the caller is on a company-approved network.
//
// IP enforcement cannot work in a cloud deployment the way it did locally
// (the old code inspected the *server's own* NIC, which is meaningless). The
// company stores the office's public egress IP(s) in `allowedRouterIPs`.
//
// Controlled by IP_ENFORCEMENT:
//   "strict" -> block callers not on the allowed list
//   anything else (default) -> log a warning, allow through
const validateOfficeIP = async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);
    const companyId = req.user && req.user.companyId;

    if (!companyId) {
      return res.status(403).json({ message: "No company context." });
    }

    const company = await Company.findById(companyId);
    if (!company || ["suspended", "deleted"].includes(company.status)) {
      return res.status(403).json({ message: "Company access unavailable." });
    }

    // Reused by checkIn/checkOut so the company is only fetched once per request.
    req.company = company;

    const allowed = Array.isArray(company.allowedRouterIPs)
      ? company.allowedRouterIPs
      : [];

    const strict = process.env.IP_ENFORCEMENT === "strict";

    if (strict && allowed.length > 0 && !allowed.includes(clientIP)) {
      return res
        .status(403)
        .json({ message: "Access denied: Not connected to an allowed network." });
    }

    if (strict && allowed.length === 0) {
      console.warn(
        `[IP] strict enforcement on but company ${company.slug} has no allowed IPs; denying access.`
      );
      return res
        .status(403)
        .json({ message: "No allowed networks configured for this company." });
    }

    if (!strict) {
      console.log(
        `[IP] client=${clientIP} allowed=${allowed.join(",")} (enforcement off)`
      );
    }

    req.clientIP = clientIP;
    next();
  } catch (error) {
    console.error("Error validating office IP:", error.message);
    return res.status(500).json({ message: "Failed to validate office IP." });
  }
};

module.exports = validateOfficeIP;
