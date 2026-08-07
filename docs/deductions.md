# Salary Deduction Rules

Deductions are computed per attendance record and stored as **absolute
currency amounts** (not percentages). The monthly net salary is:

```
netSalary = max(0, monthlySalary − totalDeductions)
```

A day's salary is the monthly salary divided by 30 (`DAYS_PER_MONTH`), rounded
to 2 decimal places.

## Rules (configurable per company)

| Event | Condition | Default Deduction | Config Key |
| --- | --- | --- | --- |
| Late check-in | Check-in more than `lateGraceMinutes` (default 15) after the scheduled start | 50% × daily salary | `lateCheckInRate` |
| No check-out | No check-out by `noCheckOutGraceHours` (default 2) hours after the scheduled end | 50% × daily salary | `noCheckOutRate` |
| Absent | No check-in at all; the hourly sweeper marks the employee absent once the working day has ended | 100% × daily salary | `absentRate` |
| Checked out before time / late check-out | Within tolerance (`ON_TIME_TOLERANCE_MINUTES` = 30) is on time; otherwise status changes but no deduction | 0 | — |

- Deductions only apply when the company has **deductions enabled**
  (`deductionEnabled: true`).
- Each company can override the default rates and grace periods via the
  **Configuration** page (admin) or the API (`/admin/updateDeductions`).
- Rates are expressed as a **percentage of a day's salary** (0–100).
- Net salary is never negative (clamped at 0).

## Implementation

All logic lives in `server/common/deductions.js`:

- `dailySalary(monthlySalary)` — `monthlySalary / 30`, rounded to cents.
- `percentOfDay(monthlySalary, ratePercent)` — daily salary × rate%.
- `lateCheckInDeduction(monthlySalary, ratePercent)` — late check-in deduction.
- `noCheckOutDeduction(monthlySalary, ratePercent)` — no check-out deduction.
- `absentDeduction(monthlySalary, ratePercent)` — absent deduction.
- `getDeductionConfig(company)` — merges company's stored config with defaults.

Grace/tolerance constants:
- `checkIn.js` uses `company.deductionConfig.lateGraceMinutes` (default 15).
- `checkOut.js` uses `company.deductionConfig.noCheckOutGraceHours` (default 2) and `ON_TIME_TOLERANCE_MINUTES` = 30.
- The absent sweeper (`server/utils/absentSweeper.js`, enabled with `CRON_ENABLED=true` on one worker) uses `company.deductionConfig.absentRate`.

## Configuration API

```
GET  /admin/getDeductions   → { deductionsEnabled, deductionConfig }
POST /admin/updateDeductions → { deductionsEnabled, deductionConfig }
```

`deductionConfig` shape:
```json
{
  "lateCheckInRate": 50,
  "noCheckOutRate": 50,
  "absentRate": 100,
  "lateGraceMinutes": 15,
  "noCheckOutGraceHours": 2
}
```

Validation: rates 0–100, grace periods ≥ 0. Partial configs are merged with defaults.
