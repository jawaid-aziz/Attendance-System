import { createRequire } from "node:module";

// Load every local module and dependency through native require() so the
// app, models, and helpers all share a single CommonJS registry (one mongoose,
// one copy of each model). Only the vitest API itself is ESM.
const require = createRequire(import.meta.url);
const { startDb, stopDb, clearDb } = require("../helpers/db.js");
const User = require("../../models/User.js");
const Attendance = require("../../models/Attendance.js");
const { createCompanyWithUniqueSlug } = require("../../common/onboarding.js");
const {
  markAbsentForNonCheckIns,
  startAbsentSweeper,
} = require("../../utils/absentSweeper.js");
const { absentDeduction } = require("../../common/deductions.js");
const bcrypt = require("bcryptjs");

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";

// 2026-01-05 is a Monday. 15:00 UTC == 20:00 in Asia/Karachi (UTC+5).
// Monday 00:00 local == 2026-01-04T19:00:00Z.
const MONDAY = "2026-01-05";
const DAY_START_KARACHI = new Date("2026-01-04T19:00:00Z");
const KARACHI_OFFICE_SCHEDULE = {
  Monday: { isOpen: true, startTime: "09:00", endTime: "18:00" },
  Tuesday: { isOpen: false },
  Wednesday: { isOpen: false },
  Thursday: { isOpen: false },
  Friday: { isOpen: false },
  Saturday: { isOpen: false },
  Sunday: { isOpen: false },
};
const CLOSED_SCHEDULE = {
  Monday: { isOpen: false },
  Tuesday: { isOpen: false },
  Wednesday: { isOpen: false },
  Thursday: { isOpen: false },
  Friday: { isOpen: false },
  Saturday: { isOpen: false },
  Sunday: { isOpen: false },
};

let company;
let employee;

beforeAll(async () => {
  await startDb();
});
afterAll(async () => {
  await stopDb();
});
beforeEach(async () => {
  await clearDb();
  company = await createCompanyWithUniqueSlug(
    {
      name: "Sweeper Co",
      timezone: "Asia/Karachi",
      officeSchedule: KARACHI_OFFICE_SCHEDULE,
      deductionEnabled: false,
    },
    null
  );
  employee = await User.create({
    firstName: "Sl",
    lastName: "Eeper",
    email: "sweep@test.io",
    password: await bcrypt.hash("Emp12345", 10),
    role: "employee",
    salary: 60000,
    companyId: company._id,
  });
});
afterEach(async () => {
  vi.useRealTimers();
});

const setKarachiTime = (utc) => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(utc));
};

describe("markAbsentForNonCheckIns", () => {
  it("marks a never-checked-in employee absent after the day ends", async () => {
    setKarachiTime(`${MONDAY}T15:00:00Z`); // 20:00 local, past 18:00 end

    await markAbsentForNonCheckIns();

    const att = await Attendance.findOne({ employee: employee._id });
    expect(att).toBeTruthy();
    expect(att.checkInstatus).toBe("Absent");
    expect(att.isActive).toBe(false);
    expect(att.day.toISOString()).toBe(DAY_START_KARACHI.toISOString());
    expect(att.deductions).toBe(0); // deductionEnabled off
  });

  it("applies the absent deduction when enabled", async () => {
    company.deductionEnabled = true;
    await company.save();
    setKarachiTime(`${MONDAY}T15:00:00Z`);

    await markAbsentForNonCheckIns();

    const att = await Attendance.findOne({ employee: employee._id });
    expect(att.deductions).toBe(absentDeduction(60000));
  });

  it("skips companies whose working day has not ended", async () => {
    setKarachiTime(`${MONDAY}T08:00:00Z`); // 13:00 local, before 18:00

    await markAbsentForNonCheckIns();

    expect(await Attendance.countDocuments({ employee: employee._id })).toBe(0);
  });

  it("skips companies closed on the current weekday", async () => {
    company.officeSchedule = CLOSED_SCHEDULE;
    await company.save();
    setKarachiTime(`${MONDAY}T15:00:00Z`);

    await markAbsentForNonCheckIns();

    expect(await Attendance.countDocuments({ employee: employee._id })).toBe(0);
  });

  it("does not mark an employee who already checked in", async () => {
    await Attendance.create({
      employee: employee._id,
      firstName: "Sl",
      date: DAY_START_KARACHI,
      day: DAY_START_KARACHI,
      checkIn: 9 * 60,
      checkInstatus: "Present",
      companyId: company._id,
    });
    setKarachiTime(`${MONDAY}T15:00:00Z`);

    await markAbsentForNonCheckIns();

    const absentRows = await Attendance.countDocuments({
      employee: employee._id,
      checkInstatus: "Absent",
    });
    expect(absentRows).toBe(0);
  });

  it("is idempotent across repeated runs", async () => {
    setKarachiTime(`${MONDAY}T15:00:00Z`);
    await markAbsentForNonCheckIns();
    await markAbsentForNonCheckIns();

    expect(
      await Attendance.countDocuments({ employee: employee._id })
    ).toBe(1);
  });
});

describe("startAbsentSweeper", () => {
  it("does not schedule a cron when disabled", () => {
    process.env.CRON_ENABLED = "false";
    expect(() => startAbsentSweeper()).not.toThrow();
  });
});
