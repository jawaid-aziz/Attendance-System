import { describe, it, expect } from "vitest";
import {
  DAYS_PER_MONTH,
  LATE_GRACE_MINUTES,
  LATE_CHECKIN_PENALTY,
  NO_CHECKOUT_PENALTY,
  ABSENT_PENALTY,
  dailySalary,
  lateCheckInDeduction,
  noCheckOutDeduction,
  absentDeduction,
} from "../../common/deductions";

describe("dailySalary", () => {
  it("divides monthly salary by 30", () => {
    expect(dailySalary(60000)).toBe(2000);
  });
  it("rounds to 2 decimal places", () => {
    expect(dailySalary(100)).toBeCloseTo(3.33, 2);
  });
  it("treats missing/invalid salaries as 0", () => {
    expect(dailySalary(undefined)).toBe(0);
    expect(dailySalary("not-a-number")).toBe(0);
  });
});

describe("deduction helpers", () => {
  it("late check-in costs half a day", () => {
    expect(lateCheckInDeduction(60000)).toBe(
      dailySalary(60000) * LATE_CHECKIN_PENALTY
    );
    expect(lateCheckInDeduction(60000)).toBe(1000);
  });
  it("no check-out costs half a day", () => {
    expect(noCheckOutDeduction(60000)).toBe(1000);
  });
  it("absent costs a full day", () => {
    expect(absentDeduction(60000)).toBe(2000);
  });
  it("all deductions are absolute currency amounts", () => {
    expect(LATE_CHECKIN_PENALTY).toBe(0.5);
    expect(NO_CHECKOUT_PENALTY).toBe(0.5);
    expect(ABSENT_PENALTY).toBe(1);
  });
});

describe("constants", () => {
  it("uses 30 days per month and 15min grace", () => {
    expect(DAYS_PER_MONTH).toBe(30);
    expect(LATE_GRACE_MINUTES).toBe(15);
  });
});
