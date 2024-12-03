const express = require("express");
// const { checkIn, checkOut, getAttendanceRecords } = require("../controllers/attendanceController")
const checkIn = require("../controllers/attendanceController/checkIn");
const checkOut = require("../controllers/attendanceController/checkOut")
const attendanceRecord = require("../controllers/attendanceController/attendanceRecord")
const verifyEmployee = require("../middleware/verifyEmployee");
const router = express.Router();

router.post("/check-in/:employeeId", verifyEmployee, checkIn); // Check-in route
router.post("/check-out/:employeeId", verifyEmployee, checkOut); // Check-out route
router.get("/records/:employeeId", verifyEmployee, attendanceRecord); // Fetch attendance records

module.exports = router;
