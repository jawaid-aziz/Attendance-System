const express = require("express");
const {
  addUser,
  editUser,
} = require("../controllers/adminController/adminController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const router = express.Router();

router.post("/add", authenticateToken, authorizeAdmin, addUser);
router.put("/edit/:id", authenticateToken, authorizeAdmin, editUser);

module.exports = router;
