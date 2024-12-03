const Attendance = require("../../models/Attendance");
const config = require("../../config/configTime");
const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
const checkIn = async (req, res) => {
    try {
        const { employeeId } = req.params;

        let serverTime; // Server time in PST
        let today; // Current date in PST (reset to midnight)

        // Fetch current time from the configured API and adjust to PST
        // try {
        //     const response = await axios.get(`${config.TIME_SERVER_URL}${config.TIMEZONE}`);
        //     const utcTime = new Date(response.data.datetime); // Time in UTC
        //     const pstOffset = 5 * 60 * 60 * 1000; // PST offset (+5 hours in milliseconds)
        //     serverTime = new Date(utcTime.getTime() + pstOffset); // Adjust to PST
        //     today = new Date(serverTime); // Initialize with the same time

        // } catch (error) {
        //     console.error("Error fetching time:", error.message);
        //     return res.status(500).json({ message: "Unable to connect to time server. Please try again later." });
        // }

        serverTime = dayjs().tz("Asia/Karachi");
        // console.log(serverTime);

        // today = serverTime.startOf("day"); // Reset to midnight PST

        // Calculate shift window (7 PM to 4 AM)
        const checkInHour = serverTime.hour();
        const isAfterMidnight = checkInHour < 4; // 00:00 to 04:00

        // Calculate shift start
        const shiftStart = isAfterMidnight
            ? serverTime.subtract(1, "day").hour(19).minute(0).second(0).millisecond(0) // Yesterday at 7 PM
            : serverTime.hour(19).minute(0).second(0).millisecond(0); // Today at 7 PM

        // Calculate shift end
        const shiftEnd = shiftStart.add(9, "hour"); // Shift ends 9 hours after start (7 PM to 4 AM)

        // Check if the user has already checked in during this shift window
        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            checkIn: { $gte: shiftStart.toDate(), $lt: shiftEnd.toDate() },
        });

        if (existingAttendance) {
            // Return an error if the user has already checked in during this shift
            return res.status(400).json({ message: "You have already checked in during this shift." });
        }


        // Check working hours (7 PM to 4 AM PST)
        //  checkInHour = serverTime.getHours(); 
        const checkInMinute = serverTime.minute();
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
        console.log(serverTime + 5);

        // Creatingg attendance record
        const attendance = new Attendance({
            employee: employeeId,
            date: serverTime.format(), // Store in UTC
            checkIn: serverTime,
            status,
            deductions,
        });

        await attendance.save();


        res.status(200).json({ message: "Check-in successful", attendance });
        console.log("attendace", attendance);
    } catch (error) {
        console.error("Error in check-in:", error);
        res.status(500).json({ message: "Error in check-in", error: error.message });
    }
    // console.log("attend",attendance);



};

module.exports = checkIn;
