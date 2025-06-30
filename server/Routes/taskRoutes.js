const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const { addTask } = require("../controllers/taskController/addTask")
const { viewTasks } = require("../controllers/taskController/viewTasks")

const router = express.Router();

router.post("/add-task", authenticateToken, authorizeAdmin, addTask)
router.get("/viewAll", authenticateToken, viewTasks)

module.exports = router;
