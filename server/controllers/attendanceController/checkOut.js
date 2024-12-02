const Attendance = require("../../models/Attendance");
// const Employee = require("../models/User");

const checkOut = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const currentTime = new Date();
        const today = new Date(currentTime.setHours(0, 0, 0, 0));

        // Find the attendance record for today
        const attendance = await Attendance.findOne({ employee: employeeId, date: today });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({ message: "No check-in found for today." });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: "Already checked out today." });
        }

        // Add half leave if no check-out occurs
        const status = currentTime.getHours() > 4 ? "No Check-Out" : attendance.status;
        const deductions = status === "No Check-Out" ? attendance.deductions + 0.5 : attendance.deductions;

        attendance.checkOut = currentTime;
        attendance.status = status;
        attendance.deductions = deductions;

        await attendance.save();

        res.status(200).json({ message: "Check-out successful", attendance });
    } catch (error) {
        console.error("Error in check-out:", error);
        res.status(500).json({ message: "Error in check-out", error: error.message });
    }
};
module.exports = checkOut;
