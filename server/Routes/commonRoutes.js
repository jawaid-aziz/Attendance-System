const express = require("express");
const { getUserById } = require("../common/getUser");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/getUser/:id", authenticateToken, getUserById);

module.exports = router;
