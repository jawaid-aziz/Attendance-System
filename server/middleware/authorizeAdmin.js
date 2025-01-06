const authorizeAdmin = (req, res, next) => {
  // Ensure that the user has a role of 'admin'
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({
        message: "Forbidden: Only admins are allowed to access this route",
      });
  }

  next(); // Proceed to the route handler if the user is an admin
};

module.exports = authorizeAdmin;
