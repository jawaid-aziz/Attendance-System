const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Company = require("../models/Company");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
const { absentDeduction } = require("../common/deductions");

dayjs.extend(timezone);
dayjs.extend(utc);

// Mark employees absent once the working day has ended and they never checked
// in. Runs as an hourly cron. Enable on a SINGLE worker only (set
// CRON_ENABLED=true there) to avoid duplicate writes across instances.
const markAbsentForNonCheckIns = async () => {
  const companies = await Company.find({ status: "active" });

  for (const company of companies) {
    const timezoneName = company.timezone || "Asia/Karachi";
    const serverTime = dayjs().tz(timezoneName);
    const today = serverTime.format("dddd");
    const dayStart = serverTime.startOf("day").toDate();

    const officeSchedule = company.officeSchedule || {};
    const todaySchedule = officeSchedule[today];

    if (!todaySchedule?.isOpen) {
      console.log(`Skipping ${company.slug}: office closed on ${today}.`);
      continue;
    }

    const [endHour, endMinute] = (todaySchedule.endTime || "18:00")
      .split(":")
      .map(Number);
    const endMinutes = endHour * 60 + endMinute;
    const nowMinutes = serverTime.hour() * 60 + serverTime.minute();

    // Only mark absent after the working day has ended
    if (nowMinutes <= endMinutes) {
      console.log(`Skipping ${company.slug}: working day not over yet.`);
      continue;
    }

    const attendedUserIds = await Attendance.distinct("employee", {
      companyId: company._id,
      day: dayStart,
    });

    const unattendedEmployees = await User.find({
      companyId: company._id,
      role: "employee",
      _id: { $nin: attendedUserIds },
    }).select("_id firstName salary");

    if (unattendedEmployees.length === 0) {
      console.log(`No unattended employees for ${company.slug}.`);
      continue;
    }

    // Upsert so repeated runs can never create duplicate absent rows.
    await Attendance.bulkWrite(
      unattendedEmployees.map((employee) => ({
        updateOne: {
          filter: { employee: employee._id, day: dayStart },
          update: {
            $setOnInsert: {
              employee: employee._id,
              firstName: employee.firstName,
              date: serverTime.toDate(),
              day: dayStart,
              checkIn: null,
              checkInstatus: "Absent",
              isActive: false,
              deductions: company.deductionEnabled
                ? absentDeduction(employee.salary)
                : 0,
              companyId: company._id,
            },
          },
          upsert: true,
        },
      }))
    );
    console.log(
      `Marked ${unattendedEmployees.length} employees absent for ${company.slug}.`
    );
  }
};

const startAbsentSweeper = () => {
  if (process.env.CRON_ENABLED !== "true") {
    console.log(
      "Absent sweeper disabled (set CRON_ENABLED=true on a single worker to enable)."
    );
    return;
  }
  const cron = require("node-cron");
  // Sweep hourly (UTC :05) for companies whose day has ended
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
  console.log("Absent sweeper enabled.");
};

module.exports = { markAbsentForNonCheckIns, startAbsentSweeper };
