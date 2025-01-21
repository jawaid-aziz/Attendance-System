const jwt = require("jsonwebtoken"); // For generating tokens

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

  if (!token)
    return res.status(401).json({ message: "Unauthorized: No token provided" }); // No token, unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Check if the error is due to token expiration
      const errorMessage =
        err.name === "TokenExpiredError"
          ? "Token expired"
          : "Forbidden: Invalid token";

      return res.status(403).json({ message: errorMessage }); // Return appropriate error
    }

    req.user = decoded; // Attach the decoded user payload to the request
    next(); // Move to the next middleware or route handler
  });
  // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  //   if (err) {
  //     return res.status(403).json({
  //       message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
  //     });
  //   }

  //   req.user = decoded; // Attach the decoded user payload to the request
  //   next();
  // })
};

module.exports = authenticateToken;
