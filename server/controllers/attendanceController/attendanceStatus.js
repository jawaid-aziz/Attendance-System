const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const Company = require("../../models/Company");
const dayjs = require("dayjs");

const getAttendanceStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Only the employee themselves or their company admin can view status
    const employee = await User.findById(employeeId);
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
        .json({ message: "Forbidden: Cannot access this status" });
    }

    const company = employee.companyId
      ? await Company.findById(employee.companyId)
      : null;
    const timezoneName = company?.timezone || "UTC";
    const serverTime = dayjs().tz(timezoneName);
    const startOfToday = serverTime.startOf("day").toDate();
    const endOfToday = serverTime.endOf("day").toDate();

    // Find today's attendance
    const attendance = await Attendance.findOne({
      employee: employeeId,
      ...(employee.companyId ? { companyId: employee.companyId } : {}),
      date: { $gte: startOfToday, $lt: endOfToday },
    });

    if (!attendance) {
      return res.status(200).json({ checkedIn: false, checkedOut: false });
    }

    res.status(200).json({
      checkedIn: !!attendance.checkIn,
      checkedOut: !!attendance.checkOut,
    });
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    res.status(500).json({ message: "Error fetching attendance status", error: error.message });
  }
};

module.exports = getAttendanceStatus;
