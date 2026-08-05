const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const Company = require("../../models/Company");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await User.findById(employeeId);
    if (!employee || !employee.companyId) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Only the employee themselves or a same-company admin can check out
    const isSelf = employeeId === req.user.id;
    const sameCompany =
      req.user.companyId &&
      employee.companyId &&
      req.user.companyId.toString() === employee.companyId.toString();
    if (!isSelf && !sameCompany) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot check out for this employee" });
    }

    const company = await Company.findById(employee.companyId);
    if (!company || company.status === "suspended") {
      return res
        .status(403)
        .json({ message: "Company access unavailable." });
    }

    const GRACE_PERIOD_HOURS = 2;
    const timezoneName = company.timezone || "UTC";
    const serverTime = dayjs().tz(timezoneName);
    const unixTime = serverTime.unix();
    const today = serverTime.format("dddd");

    const officeSchedule = company.officeSchedule || {};
    const todaySchedule = officeSchedule[today];

    if (!todaySchedule) {
      return res
        .status(400)
        .json({ message: "Office schedule is not configured for today." });
    }

    if (!todaySchedule.isOpen) {
      return res
        .status(400)
        .json({ message: "The office is closed today. Cannot check out." });
    }

    const [workEndHour, workEndMinute] = todaySchedule.endTime
      .split(":")
      .map(Number);

    const workEndTime = serverTime
      .startOf("day")
      .hour(workEndHour)
      .minute(workEndMinute);
    const noCheckOutDeadline = workEndTime.add(GRACE_PERIOD_HOURS, "hour");

    const startOfToday = serverTime.startOf("day").unix();
    const endOfToday = serverTime.endOf("day").unix();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      companyId: company._id,
      checkIn: { $gte: startOfToday, $lt: endOfToday },
    });

    if (!attendance) {
      return res
        .status(400)
        .json({ message: "No check-in found. Cannot check out." });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out today." });
    }

    let checkOutstatus = attendance.checkOutstatus || "Pending";
    let deductions = attendance.deductions || 0;

    if (serverTime.isAfter(noCheckOutDeadline)) {
      checkOutstatus = "No Check-Out";
      deductions += 2;
    } else if (
      serverTime.isAfter(workEndTime) &&
      serverTime.isBefore(noCheckOutDeadline)
    ) {
      checkOutstatus = serverTime.isSame(workEndTime, "minute")
        ? "Checked Out on Time"
        : "Late Check-Out";
    } else if (serverTime.isBefore(workEndTime)) {
      checkOutstatus = "Check Out before Time";
    }

    attendance.checkOut = unixTime;
    attendance.checkOutstatus = checkOutstatus;
    attendance.deductions = deductions;
    attendance.isActive = false;

    await attendance.save();

    res.status(200).json({ message: "Check-out successful", attendance });
  } catch (error) {
    console.error("Error in check-out:", error);
    res
      .status(500)
      .json({ message: "Error in check-out", error: error.message });
  }
};

module.exports = checkOut;
