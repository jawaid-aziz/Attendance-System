import { describe, it, expect } from "vitest";
import {
  DAYS_PER_MONTH,
  DEFAULT_CONFIG,
  LATE_GRACE_MINUTES,
  getDeductionConfig,
  dailySalary,
  percentOfDay,
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

describe("percentOfDay", () => {
  it("computes a % of the daily salary", () => {
    expect(percentOfDay(60000, 50)).toBe(1000);
    expect(percentOfDay(60000, 100)).toBe(2000);
    expect(percentOfDay(60000, 0)).toBe(0);
    expect(percentOfDay(60000, 25)).toBe(500);
  });
});

describe("deduction helpers with custom rates", () => {
  it("late check-in uses the given rate", () => {
    expect(lateCheckInDeduction(60000, 50)).toBe(1000);
    expect(lateCheckInDeduction(60000, 25)).toBe(500);
    expect(lateCheckInDeduction(60000, 0)).toBe(0);
  });
  it("no check-out uses the given rate", () => {
    expect(noCheckOutDeduction(60000, 50)).toBe(1000);
    expect(noCheckOutDeduction(60000, 10)).toBe(200);
  });
  it("absent uses the given rate", () => {
    expect(absentDeduction(60000, 100)).toBe(2000);
    expect(absentDeduction(60000, 75)).toBe(1500);
  });
  it("defaults to the configured defaults when no rate passed", () => {
    expect(lateCheckInDeduction(60000)).toBe(percentOfDay(60000, DEFAULT_CONFIG.lateCheckInRate));
    expect(noCheckOutDeduction(60000)).toBe(percentOfDay(60000, DEFAULT_CONFIG.noCheckOutRate));
    expect(absentDeduction(60000)).toBe(percentOfDay(60000, DEFAULT_CONFIG.absentRate));
  });
});

describe("getDeductionConfig", () => {
  it("returns defaults for a company without a config", () => {
    expect(getDeductionConfig({})).toEqual(DEFAULT_CONFIG);
    expect(getDeductionConfig(undefined)).toEqual(DEFAULT_CONFIG);
  });
  it("fills only the missing fields", () => {
    const config = getDeductionConfig({
      deductionConfig: { absentRate: 80 },
    });
    expect(config.absentRate).toBe(80);
    expect(config.lateCheckInRate).toBe(DEFAULT_CONFIG.lateCheckInRate);
    expect(config.lateGraceMinutes).toBe(DEFAULT_CONFIG.lateGraceMinutes);
  });
});

describe("constants", () => {
  it("uses 30 days per month and 15min default grace", () => {
    expect(DAYS_PER_MONTH).toBe(30);
    expect(LATE_GRACE_MINUTES).toBe(15);
  });
});
