const Attendance = require("../../models/Attendance");
const Employee = require("../../models/User");
const Company = require("../../models/Company");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

const attendanceRecord = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10); // 1-12

    // Only the employee themselves or their company admin can view records
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isSelf = employeeId === req.user.id;
    const sameCompany =
      req.user.companyId &&
      employee.companyId &&
      req.user.companyId.toString() === employee.companyId.toString();
    if (!isSelf && !sameCompany) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot access these records" });
    }

    const company = employee.companyId
      ? await Company.findById(employee.companyId)
      : null;
    const timezoneName = company?.timezone || "Asia/Karachi";

    // Compute the set of years that have attendance records (cheap distinct).
    const dateDocs = await Attendance.distinct("date", {
      employee: employeeId,
      ...(employee.companyId ? { companyId: employee.companyId } : {}),
    });
    const availableYears = [...new Set(
      dateDocs.map((d) => (d ? new Date(d).getUTCFullYear() : null))
    )].filter((y) => y !== null).sort();

    const filter = {
      employee: employeeId,
      ...(employee.companyId ? { companyId: employee.companyId } : {}),
    };
    if (year && month) {
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1));
      filter.date = { $gte: start, $lt: end };
    }

    const attendanceRecords = await Attendance.find(filter).sort({ date: 1 });

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

      totalDeductions += record.deductions || 0;

      return {
        ...record._doc,
        checkIn: checkInServerTime,
        checkOut: checkOutServerTime,
      };
    });

    // Deductions are absolute currency amounts; cap the monthly salary at 0.
    const totalDeductionsRounded = Math.round(totalDeductions * 100) / 100;
    const netSalary = Math.max(
      0,
      Math.round((employee.salary - totalDeductionsRounded) * 100) / 100
    );

    res.status(200).json({
      message: "Attendance records fetched successfully",
      records: convertedRecords,
      availableYears,
      totalDeductions: totalDeductionsRounded,
      monthlySalary: employee.salary,
      netSalary,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      message: "Error fetching attendance records",
      error: error.message,
    });
  }
};

module.exports = attendanceRecord;
