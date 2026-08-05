const express = require("express");
const {
  loginUser,
  registerCompany,
  completeSetup,
  changePassword,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerCompany);
router.post("/setup/:token", completeSetup);
router.post("/change-password", authenticateToken, changePassword);

module.exports = router;
