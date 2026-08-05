const express = require("express");
const {
  loginUser,
  registerCompany,
  completeSetup,
} = require("../controllers/authController");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerCompany);
router.post("/setup/:token", completeSetup);

module.exports = router;
