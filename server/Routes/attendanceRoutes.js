const express = require("express");
const checkIn = require("../controllers/attendanceController/checkIn");
const getServerTime = require("../controllers/attendanceController/serverTime");
const checkOut = require("../controllers/attendanceController/checkOut");
const attendanceRecord = require("../controllers/attendanceController/attendanceRecord");
const getAttendanceStatus = require("../controllers/attendanceController/attendanceStatus");
const validateOfficeIP = require("../middleware/validateIP");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/check-in/:employeeId", authenticateToken, validateOfficeIP, checkIn);
router.post("/check-out/:employeeId", authenticateToken, validateOfficeIP, checkOut);
router.get("/records/:employeeId", authenticateToken, attendanceRecord);
router.get("/server-time", getServerTime);
router.get("/status/:employeeId", authenticateToken, getAttendanceStatus);
module.exports = router;
