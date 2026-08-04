const express = require("express");
const { loginUser, signupUser } = require("../controllers/authController");
const router = express.Router();

router.post("/login", loginUser);
router.post("/signup", signupUser);

module.exports = router;
