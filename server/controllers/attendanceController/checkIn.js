const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const Company = require("../../models/Company");
const mongoose = require("mongoose");
const { dayjs, getCompanyTimezone } = require("../../utils/dayjs");
const logger = require("../../utils/logger");
const {
  LATE_GRACE_MINUTES,
  lateCheckInDeduction,
} = require("../../common/deductions");
const {
  getTodaySchedule,
  isOpenToday,
  canAccessUser,
} = require("../../common/company");

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
    if (!canAccessUser(req, employee)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Cannot check in for this employee" });
    }

    const company =
      req.company || (employee.companyId
        ? await Company.findById(employee.companyId)
        : null);
    if (!company || ["suspended", "deleted"].includes(company.status)) {
      return res.status(403).json({ message: "Company access unavailable." });
    }

    const serverTime = dayjs().tz(getCompanyTimezone(company));
    const unixTime = serverTime.unix();
    const dayStart = serverTime.startOf("day").toDate();

    const { schedule: todaySchedule } = getTodaySchedule(company, serverTime);

    if (!todaySchedule) {
      return res
        .status(400)
        .json({ message: "Office schedule is not configured for today." });
    }

    if (!isOpenToday(todaySchedule)) {
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
    // under concurrent requests. Matching `checkIn: null` means an absent row
    // (created by the sweeper) is claimed as a valid late check-in instead of
    // being reported as "already checked in".
    let attendance;
    try {
      const result = await Attendance.findOneAndUpdate(
        { employee: employeeId, day: dayStart, checkIn: null },
        {
          $set: {
            checkIn: unixTime,
            checkInstatus,
            isActive: true,
            deductions,
          },
          $setOnInsert: {
            employee: employeeId,
            firstName: employee.firstName,
            date: serverTime.toDate(),
            day: dayStart,
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
    } catch (err) {
      // Duplicate key: a concurrent request already created today's record.
      if (err && err.code === 11000) {
        return res
          .status(400)
          .json({ message: "You have already checked in today." });
      }
      throw err;
    }

    if (!attendance) {
      return res
        .status(400)
        .json({ message: "You have already checked in today." });
    }

    res.status(200).json({
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    logger.error("Error in check-in:", error);
    res
      .status(500)
      .json({ message: "Error in check-in", error: error.message });
  }
};

module.exports = checkIn;
