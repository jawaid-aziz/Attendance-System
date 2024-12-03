const Attendance = require("../../models/Attendance");
const config = require("../../config/configTime");
const axios = require("axios");

const checkIn = async (req, res) => {
    try {
        const { employeeId } = req.params;

        let serverTime; // Server time in PST
        let today; // Current date in PST (reset to midnight)
        
        // Fetch current time from the configured API and adjust to PST
        try {
            const response = await axios.get(`${config.TIME_SERVER_URL}${config.TIMEZONE}`);
            const utcTime = new Date(response.data.datetime); // Time in UTC
            const pstOffset = 5 * 60 * 60 * 1000; // PST offset (+5 hours in milliseconds)
            serverTime = new Date(utcTime.getTime() + pstOffset); // Adjust to PST
            today = new Date(serverTime); // Initialize with the same time

        } catch (error) {
            console.error("Error fetching time:", error.message);
            return res.status(500).json({ message: "Unable to connect to time server. Please try again later." });
        }

        // Check if attendance already exists for today
        // Calculating shift window (19:00 to 04:00)
        const checkInHour = serverTime.getHours();
        const isAfterMidnight = checkInHour < 4; // 00:00 to 04:00

        const shiftStart = new Date(serverTime);
        if (isAfterMidnight) {
            // If time is after midnight (00:00 to 04:00), shift started yesterday at 19:00
            shiftStart.setDate(shiftStart.getDate() - 1);
        }
        shiftStart.setHours(19, 0, 0, 0); // Set shift start to 19:00

        const shiftEnd = new Date(shiftStart);
        shiftEnd.setDate(shiftEnd.getDate() + 1); // Set shift end to the next day at 04:00
        shiftEnd.setHours(4, 0, 0, 0);

        // Check if the user has already checked in during this shift window
        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            checkIn: { $gte: shiftStart, $lt: shiftEnd },
        });

        if (existingAttendance) {
            return res.status(400).json({ message: "You have already checked in during this shift." });
        }


        // Check working hours (7 PM to 4 AM PST)
        //  checkInHour = serverTime.getHours(); 
        const checkInMinute = serverTime.getMinutes();
        const isWorkingHour = checkInHour >= 13 || checkInHour < 4; // 7 PM to 4 AM

        if (!isWorkingHour) {
            return res.status(400).json({ message: "Check-in time is outside working hours (7 PM to 4 AM PST)." });
        }

        // 
        let status = "Present";
        let deductions = 0;

        if (checkInHour === 13 && checkInMinute > 15) {
            status = "Late Check-In (Half Leave)";
            deductions = 0.5;
        } else if (checkInHour > 13) {
            status = "Late Check-In (Half Leave)";
            deductions = 0.5;
        }

        // Creatingg attendance record
        const attendance = new Attendance({
            employee: employeeId,
            date: today,
            checkIn: serverTime,
            status,
            deductions,
        });

        await attendance.save();

        res.status(200).json({ message: "Check-in successful", attendance });
    } catch (error) {
        console.error("Error in check-in:", error);
        res.status(500).json({ message: "Error in check-in", error: error.message });
    }
};

module.exports = checkIn;
