const Attendance = require("../../models/Attendance");
// const config = require("../../config/configTime");
// const axios = require("axios");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
// const io = require("../../index").io; // Import Socket.IO instance
// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const checkOut = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const io= req.io;
        // let serverTime;

        const timezoneName = process.env.TIMEZONE;
        const serverTime = dayjs().tz(timezoneName);// Replace with your desired timezone
        const unixTime = serverTime.unix();
        const checkOutHour = serverTime.hour();
        console.log("ser", serverTime);
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

        // if (checkOutHour > 22) {
        //     checkOutstatus = "Late Check-Out";
        // } else if (checkOutHour === 22) {
        //     checkOutstatus = "Checked Out on Time";
        // } else {
        //     return res.status(400).json({ message: "Cannot check out before 21:00." });
        // }

        // No Check-Out recorded by the end of shift
        if (!attendance.checkOut) {
            checkOutstatus = "No Check-Out";
            deductions += 0.5;
        }
        // Update the attendance record
        attendance.checkOut = parseInt(unixTime),
            attendance.checkOutstatus = checkOutstatus;
        attendance.deductions = deductions;

        await attendance.save();
      
        // await Attendance.updateOne({_id:employeeId},{isActive:false})

        // io.emit("status update",{employeeId, isActive:false})

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
