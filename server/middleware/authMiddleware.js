const jwt = require("jsonwebtoken"); // For generating tokens

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

  if (!token)
    return res.status(401).json({ message: "Unauthorized: No token provided" }); // No token, unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Forbidden: Invalid token" }); // Token invalid, forbidden
    req.user = user; // Attach user info to request
    next(); // Move to the next middleware or route handler
  });
};

module.exports = authenticateToken;
