import { describe, it, expect } from "vitest";
import {
  isSameCompany,
  isCompanyActive,
  canAccessUser,
  getTodaySchedule,
  isOpenToday,
} from "../../common/company";
import { dayjs } from "../../utils/dayjs";

describe("isSameCompany", () => {
  it("compares ObjectIds and strings", () => {
    const a = "507f1f77bcf86cd799439011";
    expect(isSameCompany(a, a)).toBe(true);
    expect(isSameCompany(a, "507f1f77bcf86cd799439012")).toBe(false);
    expect(isSameCompany(null, a)).toBe(false);
    expect(isSameCompany(a, undefined)).toBe(false);
  });
});

describe("isCompanyActive", () => {
  it("only returns true for status active", () => {
    expect(isCompanyActive({ status: "active" })).toBe(true);
    expect(isCompanyActive({ status: "suspended" })).toBe(false);
    expect(isCompanyActive({ status: "deleted" })).toBe(false);
    expect(isCompanyActive(null)).toBe(false);
  });
});

describe("canAccessUser", () => {
  const req = (role, companyId, id) => ({ user: { role, companyId, id } });

  it("allows the user themself", () => {
    const r = req("employee", "c1", "u1");
    expect(canAccessUser(r, { _id: "u1", companyId: "c1" })).toBe(true);
  });

  it("allows same-company users", () => {
    const r = req("admin", "c1", "u2");
    expect(canAccessUser(r, { _id: "u1", companyId: "c1" })).toBe(true);
  });

  it("blocks cross-company users", () => {
    const r = req("admin", "c1", "u2");
    expect(canAccessUser(r, { _id: "u1", companyId: "c2" })).toBe(false);
  });

  it("allows superadmins regardless of company", () => {
    const r = req("superadmin", null, "u2");
    expect(canAccessUser(r, { _id: "u1", companyId: "c2" })).toBe(true);
  });
});

describe("getTodaySchedule / isOpenToday", () => {
  const monday = dayjs("2026-08-03T10:00:00"); // a Monday
  const schedule = {
    Monday: { isOpen: true, startTime: "10:00", endTime: "18:00" },
    Tuesday: { isOpen: false },
  };

  it("resolves the weekday entry", () => {
    expect(
      getTodaySchedule({ officeSchedule: schedule }, monday).dayName
    ).toBe("Monday");
    expect(
      getTodaySchedule({ officeSchedule: schedule }, monday).schedule
    ).toEqual(schedule.Monday);
  });

  it("returns undefined schedule for unconfigured days", () => {
    expect(getTodaySchedule({}, monday).schedule).toBeUndefined();
  });

  it("isOpenToday respects the isOpen flag", () => {
    expect(isOpenToday(schedule.Monday)).toBe(true);
    expect(isOpenToday(schedule.Tuesday)).toBe(false);
    expect(isOpenToday(undefined)).toBe(false);
  });
});
