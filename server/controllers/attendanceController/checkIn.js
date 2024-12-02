// const Attendance = require("../models/Attendance");
const Attendance = require("../../models/Attendance")
// const Employee = require("../models/User");

const checkIn = async (req, res) => {
    try {
        console.log("hi");

        const { employeeId } = req.params; // Employee ID from the request body
        // const tokenEmployeeId = req.employeeId; // Employee ID from the decoded JWT token

        // Ensure that the token employeeId matches the body employeeId
        // if (String(employeeId) !== String(tokenEmployeeId)) {
        //     console.log("Token employeeId:", tokenEmployeeId);
        // console.log("Body employeeId:", employeeId);

        //     return res.status(403).json({ message: "You are not authorized to check in for this employee." });
        // }

        // Get current time in Pakistani Standard Time (PST - UTC+5)
        const currentTime = new Date();
        const pstOffset = 5 * 60 * 60 * 1000; // PST offset in milliseconds
        const localTime = new Date(currentTime.getTime() + pstOffset);

        const today = new Date(localTime.setHours(0, 0, 0, 0)); // Midnight time of the current day in PST

        // Check if attendance already exists for today
        let attendance = await Attendance.findOne({ employee: employeeId, date: today });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({ message: "Already checked in today." });
        }

        // Check working hours (7 PM to 4 AM PST)
        const checkInHour = localTime.getHours();
        if (checkInHour < 19 && checkInHour >= 4) {
            return res.status(400).json({ message: "Check-in time is outside working hours (7 PM to 4 AM PST)." });
        }

        // Allow only one check-in, if already checked-in during this time
        if (attendance) {
            return res.status(400).json({ message: "You can only check in once during working hours." });
        }

        // Determine status for late check-ins (after 7:15 PM)
        const status = (checkInHour === 19 && localTime.getMinutes() > 15) ? "Late Check-In" : "Present";
        const deductions = status === "Late Check-In" ? 0.5 : 0;

        // Create or update attendance record
        if (!attendance) {
            attendance = new Attendance({
                employee: employeeId,
                date: today,
                checkIn: localTime,
                status,
                deductions
            });
        } else {
            attendance.checkIn = localTime;
            attendance.status = status;
            attendance.deductions = deductions;
        }

        await attendance.save();

        res.status(200).json({ message: "Check-in successful", attendance });
    } catch (error) {
        console.error("Error in check-in:", error);
        res.status(500).json({ message: "Error in check-in", error: error.message });
    }
};
module.exports = checkIn;
