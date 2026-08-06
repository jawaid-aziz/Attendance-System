const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const Company = require("../../models/Company");
const { noCheckOutDeduction } = require("../../common/deductions");
const { dayjs, getCompanyTimezone } = require("../../utils/dayjs");

const GRACE_PERIOD_HOURS = 2;
const ON_TIME_TOLERANCE_MINUTES = 30;

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

    const company =
      req.company || (await Company.findById(employee.companyId));
    if (!company || ["suspended", "deleted"].includes(company.status)) {
      return res
        .status(403)
        .json({ message: "Company access unavailable." });
    }

    const serverTime = dayjs().tz(getCompanyTimezone(company));
    const unixTime = serverTime.unix();
    const today = serverTime.format("dddd");
    const dayStart = serverTime.startOf("day").toDate();

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

    // Find today's record
    const attendance = await Attendance.findOne({
      employee: employeeId,
      companyId: company._id,
      day: dayStart,
    });

    if (!attendance) {
      return res
        .status(400)
        .json({ message: "No check-in found. Cannot check out." });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out today." });
    }

    let checkOutstatus;
    let deductions = attendance.deductions || 0;

    if (serverTime.isBefore(workEndTime)) {
      checkOutstatus = "Check Out before Time";
    } else if (serverTime.isAfter(noCheckOutDeadline)) {
      checkOutstatus = "No Check-Out";
      if (company.deductionEnabled) {
        deductions += noCheckOutDeduction(employee.salary);
      }
    } else {
      const lateMinutes = serverTime.diff(workEndTime, "minute");
      checkOutstatus =
        lateMinutes <= ON_TIME_TOLERANCE_MINUTES
          ? "Checked Out on Time"
          : "Late Check-Out";
    }

    // Atomic guard so two concurrent requests cannot both "check out".
    const updated = await Attendance.findOneAndUpdate(
      { _id: attendance._id, checkOut: null },
      {
        $set: {
          checkOut: unixTime,
          checkOutstatus,
          deductions,
          isActive: false,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ message: "Already checked out today." });
    }

    res.status(200).json({ message: "Check-out successful", attendance: updated });
  } catch (error) {
    console.error("Error in check-out:", error);
    res
      .status(500)
      .json({ message: "Error in check-out", error: error.message });
  }
};

module.exports = checkOut;
