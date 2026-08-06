const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const Company = require("../../models/Company");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
const mongoose = require("mongoose");
const {
  LATE_GRACE_MINUTES,
  lateCheckInDeduction,
} = require("../../common/deductions");

dayjs.extend(timezone);
dayjs.extend(utc);

const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Only the employee themselves or a same-company admin can check in
    const isSelf = employeeId === req.user.id;
    const sameCompany =
      req.user.companyId &&
      employee.companyId &&
      req.user.companyId.toString() === employee.companyId.toString();
    if (!isSelf && !sameCompany) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot check in for this employee" });
    }

    const company = employee.companyId
      ? await Company.findById(employee.companyId)
      : null;
    if (!company || ["suspended", "deleted"].includes(company.status)) {
      return res.status(403).json({ message: "Company access unavailable." });
    }

    const timezoneName = company.timezone || "Asia/Karachi";
    const serverTime = dayjs().tz(timezoneName);
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
      return res.status(400).json({ message: "The office is closed today." });
    }

    const [startHour, startMinute] = todaySchedule.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = todaySchedule.endTime.split(":").map(Number);

    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    const currentMinutes = serverTime.hour() * 60 + serverTime.minute();

    const isWorkingHour =
      currentMinutes >= startTimeMinutes && currentMinutes < endTimeMinutes;

    if (!isWorkingHour) {
      return res
        .status(400)
        .json({ message: "Check-in time is outside working hours." });
    }

    let checkInstatus = "Present";
    let deductions = 0;

    if (company.deductionEnabled) {
      if (currentMinutes > startTimeMinutes + LATE_GRACE_MINUTES) {
        checkInstatus = "Late Check-In (Half Leave)";
        deductions = lateCheckInDeduction(employee.salary);
      }
    }

    // Atomic upsert keyed on (employee, day). The unique index on these two
    // fields guarantees a single attendance row per employee per day, even
    // under concurrent requests.
    let attendance;
    let lastErrorObject;
    try {
      const result = await Attendance.findOneAndUpdate(
        { employee: employeeId, day: dayStart },
        {
          $setOnInsert: {
            employee: employeeId,
            firstName: employee.firstName,
            date: serverTime.toDate(),
            day: dayStart,
            checkIn: unixTime,
            checkInstatus,
            isActive: true,
            deductions,
            companyId: company._id,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          includeResultMetadata: true,
        }
      );
      attendance = result.value;
      lastErrorObject = result.lastErrorObject;
    } catch (err) {
      // Duplicate key: a concurrent request already created today's record.
      if (err && err.code === 11000) {
        return res
          .status(400)
          .json({ message: "You have already checked in today." });
      }
      throw err;
    }

    if (lastErrorObject && lastErrorObject.updatedExisting) {
      return res
        .status(400)
        .json({ message: "You have already checked in today." });
    }

    res.status(200).json({
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.error("Error in check-in:", error);
    res
      .status(500)
      .json({ message: "Error in check-in", error: error.message });
  }
};

module.exports = checkIn;
