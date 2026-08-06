const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const COMPANY_DEFAULT_TZ = "Asia/Karachi";

// Resolve a company's timezone, falling back to the default.
const getCompanyTimezone = (company) =>
  company?.timezone || COMPANY_DEFAULT_TZ;

// Current time in a company's timezone.
const nowInCompanyTz = (company) => dayjs().tz(getCompanyTimezone(company));

module.exports = {
  dayjs,
  getCompanyTimezone,
  nowInCompanyTz,
  COMPANY_DEFAULT_TZ,
};
