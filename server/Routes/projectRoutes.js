const express = require("express");
const { viewAllProjects } = require("../controllers/projectController/viewAllProjects")
const authenticateToken = require("../middleware/authMiddleware");
const { viewProject } = require("../controllers/projectController/viewProject")
const router = express.Router();

router.get("/viewAll", authenticateToken, viewAllProjects);
router.get("/:id", authenticateToken, viewProject);
module.exports = router;
