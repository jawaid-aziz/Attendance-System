const Attendance = require("../../models/Attendance");
// const config = require("../../config/configTime");
// const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const checkOut = async (req, res) => {
    try {
        const { employeeId } = req.params;

        let serverTime;

        // Fetchinh current time from server
        // try {
        //     const response = await axios.get(`${config.TIME_SERVER_URL}${config.TIMEZONE}`, { timeout: 5000 });
        //     const utcTime = new Date(response.data.datetime); // Time in UTC
        //     const pstOffset = 5 * 60 * 60 * 1000; // PST offset (+5 hours in milliseconds)
        //     serverTime = new Date(utcTime.getTime() + pstOffset); // Adjusted to PST
        // } catch (error) {
        //     console.error("Error fetching time:", error.message);
        //     return res.status(500).json({ message: "Unable to connect to time server. Please try again later." });
        // }
        serverTime = dayjs().tz("Asia/Karachi"); // Replace with your desired timezone
        const checkOutHour = serverTime.hour();
        console.log("ser",serverTime);
        
        // Find the attendance record for this employee with a valid check-in
        //  attendance = await Attendance.findOne({
        //     employee: employeeId,
        //     checkIn: { $exists: true }, // Ensure a valid check-in exists
        // });
        // Calc the shift start and todays date for validation
        // const today = new Date(serverTime);
        // today.setHours(0, 0, 0, 0); // Reset to midnight PST

        // const shiftStart = new Date(today);
        // const checkOutHour = serverTime.hour();
        // if (checkOutHour < 4) {
        //     shiftStart.setDate(shiftStart.getDate() - 1); // If after midnight, shift started yesterday
        // }
        // shiftStart.setHours(19, 0, 0, 0); // Shift start at 19:00

        // // is there attendance record for the current shift
        // const attendance = await Attendance.findOne({
        //     employee: employeeId,
        //     checkIn: { $gte: shiftStart },
        // });

        // if (!attendance || !attendance.checkIn) {
        //     return res.status(400).json({ message: "No check-in found for the current shift." });
        // }

        // if (attendance.checkOut) {
        //     return res.status(400).json({ message: "Already checked out today." });
        // }
        // Find the attendance record for this employee with a valid check-in
        const attendance = await Attendance.findOne({
            employee: employeeId,
            checkIn: { $exists: true }, // Ensure a valid check-in exists
        });

        if (!attendance) {
            return res.status(400).json({ message: "No check-in found. Cannot check out." });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: "Already checked out today." });
        }

        let status = attendance.status; //default
        let deductions = attendance.deductions;

        if (checkOutHour > 4) {
            status = "late check-out"
            deductions = attendance.deductions; // No change
        } else if (!attendance.checkOut) {
            // No check-out recorded by the end of shift: apply half leave penalty
            status = "No Check-Out";
            deductions = attendance.deductions + 0.5;
        }
        // Update the attendance record
        attendance.checkOut = serverTime.format();
        attendance.status = status;
        attendance.deductions = deductions;

        await attendance.save();

        res.status(200).json({ message: "Check-out successful", attendance });
        console.log("out atte",attendance);
        
    } catch (error) {
        console.error("Error in check-out:", error);
        res.status(500).json({ message: "Error in check-out", error: error.message });
    }
};

module.exports = checkOut;
