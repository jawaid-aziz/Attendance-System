# Salary Deduction Rules

Deductions are computed per attendance record and stored as **absolute
currency amounts** (not percentages). The monthly net salary is:

```
netSalary = max(0, monthlySalary − totalDeductions)
```

A day's salary is the monthly salary divided by 30 (`DAYS_PER_MONTH`), rounded
to 2 decimal places.

## Rules

| Event | Condition | Deduction |
| --- | --- | --- |
| Late check-in | Check-in more than `LATE_GRACE_MINUTES` (15) after the scheduled start | 0.5 × daily salary |
| No check-out | No check-out by 2 hours after the scheduled end (`GRACE_PERIOD_HOURS`) | 0.5 × daily salary |
| Absent | No check-in at all; the hourly sweeper marks the employee absent once the working day has ended | 1 × daily salary |
| Checked out before time / late check-out | Within tolerance (`ON_TIME_TOLERANCE_MINUTES` = 30) is on time; otherwise status changes but no deduction | 0 |

- Deductions only apply when the company has **deductions enabled**
  (`deductionEnabled: true`). The stored `deductionRate` is a UI-held value
  and is **not** part of the deduction math.
- Net salary is never negative (clamped at 0).

## Implementation

All logic lives in `server/common/deductions.js`:

- `dailySalary(monthlySalary)` — `monthlySalary / 30`, rounded to cents.
- `lateCheckInDeduction(monthlySalary)` — half a day.
- `noCheckOutDeduction(monthlySalary)` — half a day.
- `absentDeduction(monthlySalary)` — a full day.

Grace/tolerance constants: `server/controllers/attendanceController/checkIn.js`
(`LATE_GRACE_MINUTES`) and `checkOut.js` (`GRACE_PERIOD_HOURS`,
`ON_TIME_TOLERANCE_MINUTES`). The absent sweeper lives in
`server/utils/absentSweeper.js` and is enabled with `CRON_ENABLED=true` on one
worker.
