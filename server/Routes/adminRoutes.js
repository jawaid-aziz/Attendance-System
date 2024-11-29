const express = require("express");
const { addUser } = require("../controllers/adminController/adminController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const router = express.Router();

router.post("/add", authenticateToken,authorizeAdmin, addUser);

module.exports = router;
