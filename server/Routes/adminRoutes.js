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

router.post("/add", addUser);
// router.put("/edit/:id", authenticateToken, authorizeAdmin, editUser);
router.put("/edit/:id", editUser);
router.delete("/delete/:id", deleteUser);
router.get("/user", getUsers);

router.get("/getTime", getTimezone);

// Route to update the timezone
router.post("/updateTime", updateTimezone);
module.exports = router;
