const Attendance = require("../../models/Attendance");
const Employee = require("../../models/User");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

const attendanceRecord = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const timezoneName = process.env.TIMEZONE || "Asia/Karachi";

    // Calculate the date range
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    // Fetch attendance records for the past 30 days
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: thirtyDaysAgo },
    });

    // Fetch employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Convert checkIn Unix time to server time and calculate total deductions
    let totalDeductions = 0;
    const convertedRecords = attendanceRecords.map((record) => {
      const checkInServerTime = record.checkIn
        ? dayjs
            .unix(record.checkIn)
            .tz(timezoneName)
            .format("YYYY-MM-DD HH:mm:ss")
        : null;

      const checkOutServerTime = record.checkOut
        ? dayjs
            .unix(record.checkOut)
            .tz(timezoneName)
            .format("YYYY-MM-DD HH:mm:ss")
        : null;

      const deductionPercentage = (record.deductions || 0) / 100; // Convert to a fraction
      totalDeductions += deductionPercentage;

      return {
        ...record._doc, // Spread the original record
        checkIn: checkInServerTime,
        checkOut: checkOutServerTime,
      };
    });

    // Calculate total salary after deductions
    const dailySalary = employee.salary / 30;
    const totalDeductionAmount = totalDeductions * employee.salary;
    const totalSalary = employee.salary - totalDeductionAmount;

    res.status(200).json({
      message: "Attendance records fetched successfully",
      records: convertedRecords,
      totalSalary,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res
      .status(500)
      .json({
        message: "Error fetching attendance records",
        error: error.message,
      });
  }
};

module.exports = attendanceRecord;
