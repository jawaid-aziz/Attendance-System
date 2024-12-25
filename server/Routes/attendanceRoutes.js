const express = require("express");
// const { checkIn, checkOut, getAttendanceRecords } = require("../controllers/attendanceController")
const checkIn = require("../controllers/attendanceController/checkIn");
const getServerTime = require("../controllers/attendanceController/serverTime")
const checkOut = require("../controllers/attendanceController/checkOut")
const attendanceRecord = require("../controllers/attendanceController/attendanceRecord")
const verifyEmployee = require("../middleware/verifyEmployee");
const statusAPI = require("../controllers/attendanceController/statusAPI");
const router = express.Router();

router.post("/check-in/:employeeId", checkIn); // Check-in route
router.post("/check-out/:employeeId", checkOut); // Check-out route
router.get("/records/:employeeId", attendanceRecord); // Fetch attendance records
router.get("/status", statusAPI);
router.get("/server-time", getServerTime);
module.exports = router;
