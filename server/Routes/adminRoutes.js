const express = require("express");
const {
  addUser,
  editUser,
  getUsers,
  deleteUser,
} = require("../controllers/adminController/adminController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const { getTimezone } = require("../controllers/TimezoneController/Timezone");
const {
  updateTimezone,
} = require("../controllers/TimezoneController/Timezone");

const {
  getDeductions,
  updateDeductions,
} = require("../controllers/adminController/configDeductions");
const { getAllowedIPs, addAllowedIP, removeAllowedIP } = require("../controllers/adminController/configRouter");
const { getOfficeSchedule, saveOfficeSchedule } = require("../controllers/adminController/configOfficeTiming");

const router = express.Router();

router.post("/add", authenticateToken, authorizeAdmin, addUser);
router.put("/edit/:id", authenticateToken, authorizeAdmin, editUser);
router.delete("/delete/:id", authenticateToken, authorizeAdmin, deleteUser);
router.get("/user", authenticateToken, authorizeAdmin, getUsers);
router.get("/getTime", authenticateToken, authorizeAdmin, getTimezone);
// Route to update the timezone
router.post("/updateTime", authenticateToken, authorizeAdmin, updateTimezone);
//route for deduction logic
router.get("/getDeductions", authenticateToken, authorizeAdmin, getDeductions);
router.post("/updateDeductions",authenticateToken,authorizeAdmin,updateDeductions);
//route for router ip configuration
router.get("/getAllowedIP", authenticateToken, authorizeAdmin, getAllowedIPs);
router.post("/addAllowedIP", authenticateToken, authorizeAdmin, addAllowedIP);
router.delete("/removeAllowedIP", authenticateToken, authorizeAdmin, removeAllowedIP);
//office timing setting
router.get("/getOfficeTiming",  getOfficeSchedule);
router.post("/saveOfficeTiming", authenticateToken, authorizeAdmin, saveOfficeSchedule);

//Project Routes

module.exports = router;
