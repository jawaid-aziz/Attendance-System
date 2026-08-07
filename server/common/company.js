// Shared company-context helpers used across controllers and jobs.

// Compare two company ids (handles ObjectId vs string) safely.
const isSameCompany = (a, b) =>
  !!a && !!b && a.toString() === b.toString();

const isCompanyActive = (company) => !!(company && company.status === "active");

// Whether a requester may act on/see a target user: themselves, any
// superadmin, or someone in the same company.
const canAccessUser = (req, target) => {
  const isSelf = target._id && req.user.id && target._id.toString() === req.user.id;
  const isSuperadmin = req.user.role === "superadmin";
  return isSelf || isSuperadmin || isSameCompany(req.user.companyId, target.companyId);
};

// Resolve the current working-day schedule for a company given a time already
// expressed in the company's timezone. Returns the schedule entry (or
// undefined) plus the weekday name.
const getTodaySchedule = (company, companyTime) => {
  const dayName = companyTime.format("dddd");
  const officeSchedule = company.officeSchedule || {};
  return { dayName, schedule: officeSchedule[dayName] };
};

const isOpenToday = (schedule) => !!schedule && schedule.isOpen === true;

module.exports = {
  isSameCompany,
  isCompanyActive,
  canAccessUser,
  getTodaySchedule,
  isOpenToday,
};
