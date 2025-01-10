const express = require("express");
const checkIn = require("../controllers/attendanceController/checkIn");
const getServerTime = require("../controllers/attendanceController/serverTime");
const checkOut = require("../controllers/attendanceController/checkOut");
const attendanceRecord = require("../controllers/attendanceController/attendanceRecord");
const getAttendanceStatus = require("../controllers/attendanceController/attendanceStatus");
const validateOfficeIP= require("../middleware/validateIP")
const router = express.Router();

router.post("/check-in/:employeeId",validateOfficeIP, checkIn); // Check-in route
router.post("/check-out/:employeeId",validateOfficeIP, checkOut); // Check-out route
router.get("/records/:employeeId", attendanceRecord); // Fetch attendance records
router.get("/server-time", getServerTime);
router.get("/status/:employeeId", getAttendanceStatus);
module.exports = router;
