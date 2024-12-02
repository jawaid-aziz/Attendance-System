const Employee= require("../../models/User");
const attendanceRecord = async (req, res) => {
    try {
        const { employeeId } = req.params; // Assuming employeeId is passed in the route parameter
        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

        const attendanceRecords = await Attendance.find({
            employee: employeeId,
            date: { $gte: thirtyDaysAgo },
        });

        const employee = await Employee.findById(employeeId);

        res.status(200).json({
            message: "Attendance records fetched successfully",
            records: attendanceRecords,
            salary: employee.salary,
        });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        res.status(500).json({ message: "Error fetching attendance records", error: error.message });
    }
};
module.exports = attendanceRecord;
