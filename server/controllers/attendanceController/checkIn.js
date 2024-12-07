const Attendance = require("../../models/Attendance");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc")
dayjs.extend(timezone);
dayjs.extend(utc);
const checkIn = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const timezoneName = process.env.TIMEZONE;
        const serverTime = dayjs().tz(timezoneName);
        const unixTime = serverTime.unix();// Convert to seconds since epoch

        console.log("Server Time:", serverTime.format()); // Human-readable time
        console.log("Unix Time:", unixTime); // Time in seconds since epoch
        console.log("Timezone:", timezoneName);
        // Extract hour and minute

        const checkInHour = serverTime.hour();
        const checkInMinute = serverTime.minute();

        // Validate working hours (9 AM to 5 PM Pakistan time)
        const isWorkingHour = checkInHour >= 5 && checkInHour < 24;

        if (!isWorkingHour) {
            return res.status(400).json({ message: "Check-in time is outside working hours (9 AM to 5 PM PST)." });
        }

        // Check if the user has already checked in on the same day
        const startOfDay = serverTime.startOf("day").toDate(); // Local start of day
        const endOfDay = serverTime.endOf("day").toDate(); // Local end of day

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

        // const formattedCheckIn = dayjs.unix(unixTime).format("YYYY-MM-DD HH:mm:ss");
        // console.log("day unix",formattedCheckIn);

        // const myUnixTimestamp = 1691622800; // start with a Unix timestamp

        // const myDate = new Date(unixTime * 1000); // convert timestamp to milliseconds and construct Date object

        // console.log("my date",myDate); // will print "Thu Aug 10 2023 01:13:20" followed by the local timezone on browser console


        // Create and save attendance record
        const attendance = new Attendance({
            employee: employeeId,
            date: serverTime, // Store local date
            checkIn: parseInt(unixTime), // Store local time
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
