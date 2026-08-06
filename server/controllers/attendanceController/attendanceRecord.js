const Attendance = require("../../models/Attendance");
const Employee = require("../../models/User");
const Company = require("../../models/Company");
const { dayjs, getCompanyTimezone } = require("../../utils/dayjs");

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
    if (!company || ["suspended", "deleted"].includes(company.status)) {
      return res.status(403).json({ message: "Company access unavailable." });
    }
    const timezoneName = getCompanyTimezone(company);

    const scopeFilter = {
      employee: employeeId,
      ...(employee.companyId ? { companyId: employee.companyId } : {}),
    };

    // Years available for the dropdown, resolved in the company timezone so
    // UTC+x tenants don't get the previous/next calendar year at year edges.
    const yearDocs = await Attendance.aggregate([
      { $match: scopeFilter },
      { $project: { y: { $year: { date: "$day", timezone: timezoneName } } } },
      { $group: { _id: "$y" } },
      { $sort: { _id: 1 } },
    ]);
    const availableYears = yearDocs.map((d) => d._id).filter((y) => y != null);

    // Month boundaries computed in the company timezone and matched against
    // the `day` key (indexed), so records from the first hours of a local
    // month stay in that month's report.
    const filter = { ...scopeFilter };
    if (Number.isInteger(year) && Number.isInteger(month)) {
      const start = dayjs
        .tz(`${year}-${String(month).padStart(2, "0")}-01`, "YYYY-MM-DD", timezoneName)
        .startOf("month")
        .toDate();
      const end = dayjs
        .tz(`${year}-${String(month).padStart(2, "0")}-01`, "YYYY-MM-DD", timezoneName)
        .add(1, "month")
        .startOf("month")
        .toDate();
      filter.day = { $gte: start, $lt: end };
    }

    const attendanceRecords = await Attendance.find(filter)
      .select(
        "date day checkIn checkOut checkInstatus checkOutstatus deductions isActive"
      )
      .sort({ date: 1 })
      .lean();

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
        id: record._id,
        date: record.date,
        day: record.day,
        checkIn: checkInServerTime,
        checkOut: checkOutServerTime,
        checkInstatus: record.checkInstatus,
        checkOutstatus: record.checkOutstatus,
        deductions: record.deductions,
        isActive: record.isActive,
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
    res.status(500).json({ message: "Error fetching attendance records" });
  }
};

module.exports = attendanceRecord;
