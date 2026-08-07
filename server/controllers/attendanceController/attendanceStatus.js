const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const Company = require("../../models/Company");
const { dayjs, getCompanyTimezone } = require("../../utils/dayjs");
const { canManageAttendance } = require("../../common/company");
const logger = require("../../utils/logger");

const getAttendanceStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Only the employee themselves or a same-company admin can view status
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (!canManageAttendance(req, employee)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot access this status" });
    }

    const company = employee.companyId
      ? await Company.findById(employee.companyId)
      : null;
    if (!company || ["suspended", "deleted"].includes(company.status)) {
      return res.status(403).json({ message: "Company access unavailable." });
    }
    const serverTime = dayjs().tz(getCompanyTimezone(company));
    const startOfToday = serverTime.startOf("day").toDate();

    // Find today's attendance using the day key (consistent with check-in)
    const attendance = await Attendance.findOne({
      employee: employeeId,
      ...(employee.companyId ? { companyId: employee.companyId } : {}),
      day: startOfToday,
    });

    if (!attendance) {
      return res.status(200).json({ checkedIn: false, checkedOut: false });
    }

    res.status(200).json({
      checkedIn: !!attendance.checkIn,
      checkedOut: !!attendance.checkOut,
    });
  } catch (error) {
    logger.error("Error fetching attendance status:", error);
    res.status(500).json({ message: "Error fetching attendance status" });
  }
};

module.exports = getAttendanceStatus;
