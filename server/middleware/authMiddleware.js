const jwt = require("jsonwebtoken"); // For generating tokens
const User = require("../models/User");

// Authenticate the request and verify the account is still valid:
// - the user still exists (deleted users lose access immediately)
// - the token version matches (password/role changes revoke old tokens)
// - role/company are taken fresh from the DB, not trusted from the JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

  if (!token)
    return res.status(401).json({ message: "Unauthorized: No token provided" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Token expired" : "Forbidden: Invalid token";
    return res.status(403).json({ message });
  }

  try {
    const user = await User.findById(decoded.id).select(
      "_id role companyId version"
    );
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Account no longer exists" });
    }
    if (decoded.version !== user.version) {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      companyId: user.companyId || null,
      version: user.version,
    };
    next();
  } catch (error) {
    console.error("Error in authenticateToken:", error.message);
    return res.status(500).json({ message: "Failed to authenticate" });
  }
};

module.exports = authenticateToken;
