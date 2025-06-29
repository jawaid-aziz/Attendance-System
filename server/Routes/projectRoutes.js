const express = require("express");
const { viewAllProjects } = require("../controllers/projectController/viewAllProjects")
const authenticateToken = require("../middleware/authMiddleware");
const { viewProject } = require("../controllers/projectController/viewProject")
const { addComment } = require("../controllers/projectController/addComment")

const router = express.Router();

router.get("/viewAll", authenticateToken, viewAllProjects);
router.get("/:id", authenticateToken, viewProject);
router.post("/:id/addComment", authenticateToken, addComment);
module.exports = router;
