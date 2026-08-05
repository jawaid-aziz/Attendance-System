const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const Company = require("../../models/Company");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
const mongoose = require("mongoose");
const cron = require("node-cron");

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
    if (!company || company.status === "suspended") {
      return res.status(403).json({ message: "Company access unavailable." });
    }

    const timezoneName = company.timezone || "Asia/Karachi";
    const serverTime = dayjs().tz(timezoneName);
    const unixTime = serverTime.unix();
    const today = serverTime.format("dddd");

    console.log("Server Time:", serverTime.format());
    console.log("Unix Time:", unixTime);
    console.log("Timezone:", timezoneName);
    console.log("Company:", company.slug);

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

    const checkInHour = serverTime.hour();
    const checkInMinute = serverTime.minute();

    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    const currentMinutes = checkInHour * 60 + checkInMinute;

    const isWorkingHour =
      currentMinutes >= startTimeMinutes && currentMinutes <= endTimeMinutes;

    if (!isWorkingHour) {
      return res
        .status(400)
        .json({ message: "Check-in time is outside working hours." });
    }

    const startOfDay = serverTime.startOf("day").toDate();
    const endOfDay = serverTime.endOf("day").toDate();

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: "You have already checked in today." });
    }

    const firstName = employee.firstName;

    const deductionsEnabled = !!company.deductionEnabled;
    const deductionRate = company.deductionRate || 0;

    let checkInstatus = "Present";
    let deductions = 0;

    if (deductionsEnabled) {
      if (currentMinutes > startTimeMinutes + 15) {
        checkInstatus = "Late Check-In (Half Leave)";
        deductions = deductionRate / 3;
      }
    }

    const attendance = new Attendance({
      employee: employeeId,
      firstName: firstName,
      date: serverTime,
      checkIn: unixTime,
      checkInstatus,
      isActive: true,
      deductions,
      companyId: company._id,
    });

    await attendance.save();

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

const markAbsentForNonCheckIns = async () => {
  try {
    const companies = await Company.find({ status: "active" });

    for (const company of companies) {
      const timezoneName = company.timezone || "Asia/Karachi";
      const serverTime = dayjs().tz(timezoneName);
      const today = serverTime.format("dddd");

      const officeSchedule = company.officeSchedule || {};
      const todaySchedule = officeSchedule[today];

      if (!todaySchedule?.isOpen) {
        console.log(
          `Skipping ${company.slug}: office closed on ${today}.`
        );
        continue;
      }

      const [endHour, endMinute] = (todaySchedule.endTime || "18:00")
        .split(":")
        .map(Number);
      const endMinutes = endHour * 60 + endMinute;
      const nowMinutes = serverTime.hour() * 60 + serverTime.minute();

      // Only mark absent after the working day has ended
      if (nowMinutes <= endMinutes) {
        console.log(
          `Skipping ${company.slug}: working day not over yet.`
        );
        continue;
      }

      const attendedUserIds = await Attendance.distinct("employee", {
        companyId: company._id,
        date: {
          $gte: serverTime.startOf("day").toDate(),
          $lt: serverTime.endOf("day").toDate(),
        },
      });

      const unattendedEmployees = await User.find({
        companyId: company._id,
        role: "employee",
        _id: { $nin: attendedUserIds },
      }).select("_id firstName");

      if (unattendedEmployees.length === 0) {
        console.log(`No unattended employees for ${company.slug}.`);
        continue;
      }

      const absentRecords = unattendedEmployees.map((employee) => ({
        employee: employee._id,
        firstName: employee.firstName,
        date: serverTime.toDate(),
        checkIn: null,
        checkInstatus: "Absent",
        isActive: false,
        deductions: company.deductionRate || 0,
        companyId: company._id,
      }));

      await Attendance.insertMany(absentRecords);
      console.log(
        `Marked ${absentRecords.length} employees absent for ${company.slug}.`
      );
    }
  } catch (error) {
    console.error("Error marking absentees:", error);
  }
};

// Sweep hourly (UTC :05) and mark absentees for companies whose day has ended
cron.schedule(
  "5 * * * *",
  async () => {
    try {
      await markAbsentForNonCheckIns();
    } catch (error) {
      console.error("Cron job error:", error);
    }
  },
  { timezone: "Etc/UTC" }
);

module.exports = checkIn;
