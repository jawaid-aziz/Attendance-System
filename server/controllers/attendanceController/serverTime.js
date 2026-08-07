const Company = require("../../models/Company");
const {
  getTodaySchedule,
  isOpenToday,
} = require("../../common/company");
const { dayjs, getCompanyTimezone } = require("../../utils/dayjs");
const logger = require("../../utils/logger");

const getServerTime = async (req, res) => {
  try {
    let timezoneName = process.env.TIMEZONE || "Asia/Karachi";
    let isAllowedTime = null;

    // When a company slug is supplied, derive allowed time from that
    // company's own schedule/timezone instead of global env config.
    const { slug } = req.query;
    if (slug) {
      const company = await Company.findOne({ slug });
      if (company && company.status !== "deleted") {
        timezoneName = getCompanyTimezone(company);
        const serverTime = dayjs().tz(timezoneName);
        const { schedule: todaySchedule } = getTodaySchedule(company, serverTime);
        if (isOpenToday(todaySchedule)) {
          const [startHour, startMinute] = (todaySchedule.startTime || "00:00")
            .split(":")
            .map(Number);
          const [endHour, endMinute] = (todaySchedule.endTime || "23:59")
            .split(":")
            .map(Number);
          const nowMinutes = serverTime.hour() * 60 + serverTime.minute();
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;
          isAllowedTime = nowMinutes >= startMinutes && nowMinutes < endMinutes;
        } else {
          isAllowedTime = false;
        }
      }
    } else {
      const startHour = parseInt(process.env.WORK_START_HOUR, 10) || 9;
      const endHour = parseInt(process.env.WORK_END_HOUR, 10) || 22;
      const serverTime = dayjs().tz(timezoneName);
      const currentHour = serverTime.hour();
      isAllowedTime = currentHour >= startHour && currentHour < endHour;
    }

    res.status(200).json({
      serverTime: dayjs().tz(timezoneName).format("YYYY-MM-DD HH:mm:ss"),
      timezone: timezoneName,
      isAllowedTime,
    });
  } catch (error) {
    logger.error("Error fetching server time:", error.message);
    res.status(500).json({ message: "Error fetching server time." });
  }
};

module.exports = getServerTime;
