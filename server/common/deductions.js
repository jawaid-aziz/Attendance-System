// Centralized, consistent salary deduction rules.
//
// Deductions are stored as an absolute currency amount per attendance record.
// - Late check-in (> LATE_GRACE_MINUTES past start): half a day
// - No check-out (past the grace deadline): half a day
// - Absent (no check-in at all): a full day
//
// A day's salary is the monthly salary divided by DAYS_PER_MONTH.

const DAYS_PER_MONTH = 30;
const LATE_GRACE_MINUTES = 15;
const LATE_CHECKIN_PENALTY = 0.5; // fraction of a day
const NO_CHECKOUT_PENALTY = 0.5; // fraction of a day
const ABSENT_PENALTY = 1; // fraction of a day

const roundCurrency = (n) => Math.round(n * 100) / 100;

const dailySalary = (monthlySalary) =>
  roundCurrency((Number(monthlySalary) || 0) / DAYS_PER_MONTH);

const lateCheckInDeduction = (monthlySalary) =>
  roundCurrency(dailySalary(monthlySalary) * LATE_CHECKIN_PENALTY);

const noCheckOutDeduction = (monthlySalary) =>
  roundCurrency(dailySalary(monthlySalary) * NO_CHECKOUT_PENALTY);

const absentDeduction = (monthlySalary) =>
  roundCurrency(dailySalary(monthlySalary) * ABSENT_PENALTY);

module.exports = {
  DAYS_PER_MONTH,
  LATE_GRACE_MINUTES,
  LATE_CHECKIN_PENALTY,
  NO_CHECKOUT_PENALTY,
  ABSENT_PENALTY,
  dailySalary,
  lateCheckInDeduction,
  noCheckOutDeduction,
  absentDeduction,
};
