// Centralized, consistent salary deduction rules.
//
// Deductions are stored as an absolute currency amount per attendance record,
// computed from a configurable % of a day's salary:
// - Late check-in (> late grace minutes past start): lateCheckInRate %
// - No check-out (past the grace deadline): noCheckOutRate %
// - Absent (no check-in at all): absentRate %
//
// A day's salary is the monthly salary divided by DAYS_PER_MONTH. Rates live
// on the company document (Company.deductionConfig) so each workspace can tune
// them; getDeductionConfig fills defaults for anything missing.

const DAYS_PER_MONTH = 30;

const DEFAULT_CONFIG = {
  lateCheckInRate: 50, // % of a day's salary
  noCheckOutRate: 50, // % of a day's salary
  absentRate: 100, // % of a day's salary
  lateGraceMinutes: 15,
  noCheckOutGraceHours: 2,
};

// Deprecated legacy constants (fractions of a day). Kept for any caller still
// importing them, but new code should read from the company config instead.
const LATE_CHECKIN_PENALTY = DEFAULT_CONFIG.lateCheckInRate / 100;
const NO_CHECKOUT_PENALTY = DEFAULT_CONFIG.noCheckOutRate / 100;
const ABSENT_PENALTY = DEFAULT_CONFIG.absentRate / 100;
const LATE_GRACE_MINUTES = DEFAULT_CONFIG.lateGraceMinutes;

// Merge a company's stored config with defaults so legacy companies (saved
// before the config object existed) still resolve to sane values.
const getDeductionConfig = (company) => {
  const stored = (company && company.deductionConfig) || {};
  return {
    lateCheckInRate: Number.isFinite(stored.lateCheckInRate)
      ? stored.lateCheckInRate
      : DEFAULT_CONFIG.lateCheckInRate,
    noCheckOutRate: Number.isFinite(stored.noCheckOutRate)
      ? stored.noCheckOutRate
      : DEFAULT_CONFIG.noCheckOutRate,
    absentRate: Number.isFinite(stored.absentRate)
      ? stored.absentRate
      : DEFAULT_CONFIG.absentRate,
    lateGraceMinutes: Number.isFinite(stored.lateGraceMinutes)
      ? stored.lateGraceMinutes
      : DEFAULT_CONFIG.lateGraceMinutes,
    noCheckOutGraceHours: Number.isFinite(stored.noCheckOutGraceHours)
      ? stored.noCheckOutGraceHours
      : DEFAULT_CONFIG.noCheckOutGraceHours,
  };
};

const roundCurrency = (n) => Math.round(n * 100) / 100;

const dailySalary = (monthlySalary) =>
  roundCurrency((Number(monthlySalary) || 0) / DAYS_PER_MONTH);

// ratePercent is a % of a day's salary (0-100).
const percentOfDay = (monthlySalary, ratePercent) =>
  roundCurrency((dailySalary(monthlySalary) * (Number(ratePercent) || 0)) / 100);

const lateCheckInDeduction = (monthlySalary, ratePercent) =>
  percentOfDay(
    monthlySalary,
    ratePercent === undefined ? DEFAULT_CONFIG.lateCheckInRate : ratePercent
  );

const noCheckOutDeduction = (monthlySalary, ratePercent) =>
  percentOfDay(
    monthlySalary,
    ratePercent === undefined ? DEFAULT_CONFIG.noCheckOutRate : ratePercent
  );

const absentDeduction = (monthlySalary, ratePercent) =>
  percentOfDay(
    monthlySalary,
    ratePercent === undefined ? DEFAULT_CONFIG.absentRate : ratePercent
  );

module.exports = {
  DAYS_PER_MONTH,
  DEFAULT_CONFIG,
  LATE_GRACE_MINUTES,
  LATE_CHECKIN_PENALTY,
  NO_CHECKOUT_PENALTY,
  ABSENT_PENALTY,
  getDeductionConfig,
  dailySalary,
  percentOfDay,
  lateCheckInDeduction,
  noCheckOutDeduction,
  absentDeduction,
};
