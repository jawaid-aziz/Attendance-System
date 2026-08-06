const { dayjs } = require("../utils/dayjs");

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

// A schedule is valid if every key is a weekday and each open day has an
// `isOpen` boolean plus "HH:mm" start/end times when open.
const isValidOfficeSchedule = (schedule) => {
  if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
    return false;
  }
  const keys = Object.keys(schedule);
  if (!keys.every((k) => WEEKDAYS.includes(k))) {
    return false;
  }
  for (const day of WEEKDAYS) {
    const entry = schedule[day];
    if (entry === undefined) continue;
    if (!entry || typeof entry !== "object" || typeof entry.isOpen !== "boolean") {
      return false;
    }
    if (entry.isOpen) {
      if (!TIME_RE.test(entry.startTime || "") || !TIME_RE.test(entry.endTime || "")) {
        return false;
      }
    }
  }
  return true;
};

const isValidTimezone = (tz) => {
  if (!tz || typeof tz !== "string") return false;
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      return Intl.supportedValuesOf("timeZone").includes(tz);
    }
    dayjs().tz(tz); // throws for unknown zones
    return true;
  } catch {
    return false;
  }
};

module.exports = { isValidOfficeSchedule, isValidTimezone, WEEKDAYS };
