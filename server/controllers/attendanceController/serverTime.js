const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc")
// const { io } = require("../../index");
const cron = require("node-cron");

dayjs.extend(timezone);
dayjs.extend(utc);

const getServerTime = (req, res) => {
    try {
        const timezoneName = process.env.TIMEZONE || "UTC";
        const startHour = parseInt(process.env.WORK_START_HOUR, 10) || 9;
        const endHour = parseInt(process.env.WORK_END_HOUR, 10) || 22;

        const serverTime = dayjs().tz(timezoneName);
        const currentHour = serverTime.hour();

        const isAllowedTime = currentHour >= startHour && currentHour < endHour; // Example hours

        res.status(200).json({ isAllowedTime, serverTime: serverTime.format("YYYY-MM-DD HH:mm:ss"),})
    } catch (error) {
        console.error("Error fetching server time:", error.message);
        res.status(500).json({ message: "Error fetching server time." });
    }
};

module.exports = getServerTime
