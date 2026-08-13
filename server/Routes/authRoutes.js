const express = require("express");
const {
  loginUser,
  registerCompany,
  completeSetup,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerCompany);
router.post("/setup/:token", completeSetup);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", authenticateToken, changePassword);

module.exports = router;
