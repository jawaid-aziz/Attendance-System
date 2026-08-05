const authorizeSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      message: "Forbidden: Superadmin access required",
    });
  }
  next();
};

module.exports = authorizeSuperAdmin;
