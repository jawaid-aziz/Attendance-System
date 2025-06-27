const express = require("express");
const { viewAllProjects } = require("../controllers/projectController/viewAllProjects")
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/viewAll", authenticateToken, viewAllProjects)

module.exports = router;
