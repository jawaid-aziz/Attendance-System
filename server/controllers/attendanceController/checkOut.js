// const Attendance = require("../../models/Attendance");
// const dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// const timezone = require("dayjs/plugin/timezone");
// dayjs.extend(utc);
// dayjs.extend(timezone);

// const checkOut = async (req, res) => {
//     try {
//         const { employeeId } = req.params;
//         const io = req.io;

//         const GRACE_PERIOD_HOURS = 2;
//         const timezoneName = process.env.TIMEZONE || "UTC";
//         const serverTime = dayjs().tz(timezoneName);
//         const unixTime = serverTime.unix();
//         const workEndHour = parseInt(process.env.WORK_END_HOUR, 10) || 17;

//         // Calculate exact work end time and no-checkout deadline
//         const workEndTime = serverTime.startOf("day").hour(workEndHour); // e.g., 17:00
//         const noCheckOutDeadline = workEndTime.add(GRACE_PERIOD_HOURS, "hour"); // e.g., 19:00

//         const startOfToday = serverTime.startOf("day").unix(); // Start of the day
//         const endOfToday = serverTime.endOf("day").unix(); // End of the day

//         // Find today's attendance
//         const attendance = await Attendance.findOne({
//             employee: employeeId,
//             checkIn: { $gte: startOfToday, $lt: endOfToday },
//         });

//         if (!attendance) {
//             return res.status(400).json({ message: "No check-in found. Cannot check out." });
//         }

//         if (attendance.checkOut) {
//             return res.status(400).json({ message: "Already checked out today." });
//         }

//         let checkOutstatus = attendance.checkOutstatus; // Default status
//         let deductions = attendance.deductions;

//         if (serverTime.isAfter(noCheckOutDeadline)) {
//             // Past the deadline and no check-out recorded
//             checkOutstatus = "No Check-Out";
//             deductions += 2;
//         } else if (serverTime.isAfter(workEndTime) && serverTime.isBefore(noCheckOutDeadline)) {
//             // Checked out on time or late check-out within the grace period
//             checkOutstatus = serverTime.isSame(workEndTime) ? "Checked Out on Time" : "Late Check-Out";
//         }
//         //  else if (serverTime.isBefore(workEndTime)) {
//         //     // Attempting to check out before the work end time
//         //     return res.status(400).json({ message: `Cannot check out before ${workEndHour}:00.` });
//         // }

//         // Update attendance record
//         attendance.checkOut = unixTime;
//         attendance.checkOutstatus = checkOutstatus;
//         attendance.deductions = deductions;

//         await attendance.save();

//         // Notify admins of status change
//         io.emit("status update", { employeeId, isActive: false });

//         res.status(200).json({ message: "Check-out successful", attendance });
//     } catch (error) {
//         console.error("Error in check-out:", error);
//         res.status(500).json({ message: "Error in check-out", error: error.message });
//     }
// };

// module.exports = checkOut;

const Attendance = require("../../models/Attendance");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const checkOut = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const io = req.io;

        if (!io) {
            console.warn("Socket.IO instance not found in request.");
            return res.status(500).json({ message: "Server error. Notification system unavailable." });
        }

        const GRACE_PERIOD_HOURS = 2;
        const timezoneName = process.env.TIMEZONE || "UTC";
        const serverTime = dayjs().tz(timezoneName);
        const unixTime = serverTime.unix();
        const workEndHour = parseInt(process.env.WORK_END_HOUR, 10) || 17;

        const workEndTime = serverTime.startOf("day").hour(workEndHour); // e.g., 17:00
        const noCheckOutDeadline = workEndTime.add(GRACE_PERIOD_HOURS, "hour"); // e.g., 19:00

        const startOfToday = serverTime.startOf("day").unix(); // Start of the day
        const endOfToday = serverTime.endOf("day").unix(); // End of the day

        const attendance = await Attendance.findOne({
            employee: employeeId,
            checkIn: { $gte: startOfToday, $lt: endOfToday },
        });

        if (!attendance) {
            return res.status(400).json({ message: "No check-in found. Cannot check out." });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: "Already checked out today." });
        }

        let checkOutstatus = attendance.checkOutstatus || "Pending";
        let deductions = attendance.deductions || 0;

        if (serverTime.isAfter(noCheckOutDeadline)) {
            checkOutstatus = "No Check-Out";
            deductions += 2;
        } else if (serverTime.isAfter(workEndTime) && serverTime.isBefore(noCheckOutDeadline)) {
            checkOutstatus = serverTime.isSame(workEndTime, "minute") ? "Checked Out on Time" : "Late Check-Out";
        } else if (serverTime.isBefore(workEndTime)){
            checkOutstatus="Check Out before Time";
        }

        attendance.checkOut = unixTime;
        attendance.checkOutstatus = checkOutstatus;
        attendance.deductions = deductions;
        attendance.isActive = false;

        await attendance.save();

        io.emit("status update", { employeeId, isActive: false });

        res.status(200).json({ message: "Check-out successful", attendance });
    } catch (error) {
        console.error("Error in check-out:", error);
        res.status(500).json({ message: "Error in check-out", error: error.message });
    }
};

module.exports = checkOut;
