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
        // let serverTime;

        const timezoneName = process.env.TIMEZONE;
        const serverTime = dayjs().tz(timezoneName);// Replace with your desired timezone
        const unixTime = serverTime.unix();
        const checkOutHour = serverTime.hour();
        console.log("ser", serverTime);
        const officeEndHour = 10; // Office hours end at 5 PM (17:00)
        const noCheckOutDeadline = serverTime.startOf("day").hour(officeEndHour + 2); // 2 hours after office ends
        const startOfToday = serverTime.startOf("day").unix(); // Start of day in seconds
        const endOfToday = serverTime.endOf("day").unix();
        const attendance = await Attendance.findOne({
            employee: employeeId,
            checkIn: { $gte: startOfToday, $lt: endOfToday }, // Ensure a valid check-in exists
        });

        if (!attendance) {
            return res.status(400).json({ message: "No check-in found. Cannot check out." });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: "Already checked out today." });
        }

        let checkOutstatus = attendance.checkOutstatus; //default
        let deductions = attendance.deductions;

        if (serverTime.isAfter(noCheckOutDeadline)) {
            // If past the deadline and no check-out recorded
            checkOutstatus = "No Check-Out";
            deductions += 2;
        }
        else if (serverTime.hour() > officeEndHour && serverTime.isBefore(noCheckOutDeadline)) {
            // Checked out after office hours but before the "No Check-Out" deadline
            checkOutstatus = "Late Check-Out";
        } else if (checkOutHour === 5) {
            checkOutstatus = "Checked Out on Time";
        }
        else {
            return res.status(400).json({ message: "Cannot check out before 21:00." });
        }

        // No Check-Out recorded by the end of shift
        if (!attendance.checkOut) {
            checkOutstatus = "No Check-Out";
            deductions += 2;
        }
        // Update the attendance record
        attendance.checkOut = parseInt(unixTime),
            attendance.checkOutstatus = checkOutstatus;
        attendance.deductions = deductions;

        await attendance.save();

        // Notify admins of status change
        await Attendance.updateOne(
            {
                employee: employeeId,
                date: {
                    $gte: serverTime.startOf("day").toDate(),
                    $lt: serverTime.endOf("day").toDate(),
                },
            },
            { $set: { isActive: false } }
        );

        // Notify admins of status change
        io.emit("status update", { employeeId, isActive: false });

        res.status(200).json({ message: "Check-out successful", attendance });
        console.log("out atte", attendance);

    } catch (error) {
        console.error("Error in check-out:", error);
        res.status(500).json({ message: "Error in check-out", error: error.message });
    }
};

module.exports = checkOut;
