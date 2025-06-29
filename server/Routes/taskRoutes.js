const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");

const router = express.Router();

router.post("/add-task", authenticateToken, authorizeAdmin)

module.exports = router;
