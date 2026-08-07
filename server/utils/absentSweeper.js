const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Company = require("../models/Company");
const { absentDeduction } = require("../common/deductions");
const {
  getTodaySchedule,
  isOpenToday,
} = require("../common/company");
const { dayjs, getCompanyTimezone } = require("./dayjs");
const logger = require("./logger");

// Mark employees absent once the working day has ended and they never checked
// in. Runs as an hourly cron. Enable on a SINGLE worker only (set
// CRON_ENABLED=true there) to avoid duplicate writes across instances.
const markAbsentForNonCheckIns = async () => {
  const companies = await Company.find({ status: "active" });

  for (const company of companies) {
    const serverTime = dayjs().tz(getCompanyTimezone(company));
    const dayStart = serverTime.startOf("day").toDate();

    const { schedule: todaySchedule } = getTodaySchedule(company, serverTime);

    if (!isOpenToday(todaySchedule)) {
      logger.info(`Skipping ${company.slug}: office closed today.`);
      continue;
    }

    const [endHour, endMinute] = (todaySchedule.endTime || "18:00")
      .split(":")
      .map(Number);
    const endMinutes = endHour * 60 + endMinute;
    const nowMinutes = serverTime.hour() * 60 + serverTime.minute();

    // Only mark absent after the working day has ended
    if (nowMinutes <= endMinutes) {
      logger.info(`Skipping ${company.slug}: working day not over yet.`);
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
      logger.info(`No unattended employees for ${company.slug}.`);
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
    logger.info(
      `Marked ${unattendedEmployees.length} employees absent for ${company.slug}.`
    );
  }
};

const startAbsentSweeper = () => {
  if (process.env.CRON_ENABLED !== "true") {
    logger.info(
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
        logger.error("Cron job error:", error);
      }
    },
    { timezone: "Etc/UTC" }
  );
  logger.info("Absent sweeper enabled.");
};

module.exports = { markAbsentForNonCheckIns, startAbsentSweeper };
