const express = require("express");
const {
  addUser,
  editUser,
  getUsers,
  deleteUser,
} = require("../controllers/adminController/adminController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const {getTimezone} = require("../controllers/TimezoneController/Timezone")
const {updateTimezone} = require("../controllers/TimezoneController/Timezone")
const router = express.Router();

router.post("/add",authenticateToken, authorizeAdmin, addUser);
// router.put("/edit/:id", authenticateToken, authorizeAdmin, editUser);
router.put("/edit/:id", authenticateToken, authorizeAdmin, editUser);
router.delete("/delete/:id",authenticateToken, authorizeAdmin, deleteUser);
router.get("/user",authenticateToken, authorizeAdmin, getUsers);

router.get("/getTime",authenticateToken, authorizeAdmin, getTimezone);

// Route to update the timezone
router.post("/updateTime",authenticateToken, authorizeAdmin, updateTimezone);
module.exports = router;
