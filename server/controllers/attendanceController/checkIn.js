const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc")
// const { io } = require("../../index");

dayjs.extend(timezone);
dayjs.extend(utc);
const checkIn = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const io = req.io;
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
        const isWorkingHour = checkInHour >= 10 && checkInHour < 24;

        if (!isWorkingHour) {
            return res.status(400).json({ message: "Check-in time is outside working hours (9 AM to 5 PM PST)." });
        }

        // Check if the user has already checked in on the same day
        const startOfDay = serverTime.startOf("day").toDate(); // Local start of day
        const endOfDay = serverTime.endOf("day").toDate(); // Local end of day
        const cutoffTime = dayjs(startOfDay).add(4, "hours").toDate(); // Starting time + 4 hours


        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: startOfDay, $lt: endOfDay },
        });

        if (existingAttendance) {
            return res.status(400).json({ message: "You have already checked in today." });
        }
        const employee = await User.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }


        const firstName = employee.firstName;
        // Determine status and deductions based on check-in time
        let checkInstatus = "Present";
        let deductions = 0;

        if (checkInHour === 9 && checkInMinute > 15) {
            checkInstatus = "Late Check-In (Half Leave)";
            deductions = 2;
        } else if (checkInHour > 9) {
            checkInstatus = "Late Check-In (Half Leave)";
            deductions = 2;
        }



        // Create and save attendance record
        const attendance = new Attendance({
            employee: employeeId,
            firstName: firstName,
            date: serverTime, // Store local date
            checkIn: parseInt(unixTime), // Store local time
            checkInstatus,
            isActive: true,
            deductions,
        });

        await attendance.save();

        await Attendance.findOneAndUpdate(
            { employee: employeeId, date: { $gte: startOfDay, $lt: endOfDay } },
            { isActive: true }
        );

        // Emit status update via Socket.IO

        io.emit("status update", {
            employeeId: employeeId.toString(), // Correct Employee ID
            isActive: true,
        });
        console.log("Emitting employee ID:", employeeId.toString());



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
