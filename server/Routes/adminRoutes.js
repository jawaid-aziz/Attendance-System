const express = require("express");
const {
  addUser,
  editUser,
  getUsers,
  deleteUser,
} = require("../controllers/adminController/adminController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const authorizeCompany = require("../middleware/authorizeCompany");
const { getTimezone, updateTimezone } = require("../controllers/TimezoneController/Timezone");

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
router.get("/getTime", authenticateToken, authorizeAdmin, authorizeCompany, getTimezone);
router.post("/updateTime", authenticateToken, authorizeAdmin, authorizeCompany, updateTimezone);
router.get("/getDeductions", authenticateToken, authorizeAdmin, authorizeCompany, getDeductions);
router.post("/updateDeductions", authenticateToken, authorizeAdmin, authorizeCompany, updateDeductions);
router.get("/getAllowedIP", authenticateToken, authorizeAdmin, authorizeCompany, getAllowedIPs);
router.post("/addAllowedIP", authenticateToken, authorizeAdmin, authorizeCompany, addAllowedIP);
router.delete("/removeAllowedIP", authenticateToken, authorizeAdmin, authorizeCompany, removeAllowedIP);
//office timing setting (employees also read the schedule)
router.get("/getOfficeTiming", authenticateToken, authorizeCompany, getOfficeSchedule);
router.post("/saveOfficeTiming", authenticateToken, authorizeAdmin, authorizeCompany, saveOfficeSchedule);

module.exports = router;
