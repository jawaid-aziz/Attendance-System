const Attendance = require("../../models/Attendance");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc")
dayjs.extend(timezone);

const checkIn = async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Get current time in Pakistan time zone (Asia/Karachi)
        const serverTime = dayjs().utcOffset(300);

        // Extract hour and minute
        const checkInHour = serverTime.hour();
        const checkInMinute = serverTime.minute();

        // Validate working hours (9 AM to 5 PM Pakistan time)
        const isWorkingHour = checkInHour >= 9 && checkInHour < 22;

        if (!isWorkingHour) {
            return res.status(400).json({ message: "Check-in time is outside working hours (9 AM to 5 PM PST)." });
        }

        // Check if the user has already checked in on the same day
        const startOfDay = serverTime.startOf("day").toDate(); // Pakistan start of day
        const endOfDay = serverTime.endOf("day").toDate(); // Pakistan end of day

        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            checkIn: { $gte: startOfDay, $lt: endOfDay },
        });

        if (existingAttendance) {
            return res.status(400).json({ message: "You have already checked in today." });
        }

        // Determine status and deductions based on check-in time
        let checkInstatus = "Present";
        let deductions = 0;

        if (checkInHour === 9 && checkInMinute > 15) {
            checkInstatus = "Late Check-In (Half Leave)";
            deductions = 0.5;
        } else if (checkInHour > 9) {
            checkInstatus = "Late Check-In (Half Leave)";
            deductions = 0.5;
        }

        // Create and save attendance record
        const attendance = new Attendance({
            employee: employeeId,
            date: serverTime, // Store local date
            checkIn: serverTime, // Store local time
            checkInstatus,
            deductions,
        });

        await attendance.save();

        res.status(200).json({
            message: "Check-in successful",
            attendance,
        });

        console.log("Attendance:", attendance);
    } catch (error) {
        console.error("Error in check-in:", error);
        res.status(500).json({ message: "Error in check-in", error: error.message });
    }
};

module.exports = checkIn;
