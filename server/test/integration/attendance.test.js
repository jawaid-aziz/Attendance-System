import { createRequire } from "node:module";

// Load every local module and dependency through native require() so the
// app, models, and helpers all share a single CommonJS registry (one mongoose,
// one copy of each model). Only the vitest API itself is ESM.
const require = createRequire(import.meta.url);
const { app } = require("../helpers/app.js");
const { startDb, stopDb, clearDb } = require("../helpers/db.js");
const User = require("../../models/User.js");
const { createCompanyWithUniqueSlug } = require("../../common/onboarding.js");
const { generateToken } = require("../../utils/tokenUtils.js");
const { WEEKDAYS } = require("../../common/validation.js");
const bcrypt = require("bcryptjs");
const request = require("supertest");

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";

// A 24/7 schedule makes the attendance flow independent of the wall clock:
// the office is always open for check-in and check-out.
const alwaysOpenSchedule = Object.fromEntries(
  WEEKDAYS.map((d) => [
    d,
    { isOpen: true, startTime: "00:00", endTime: "23:59" },
  ])
);

let company;
let admin;
let employee;
let adminToken;
let employeeToken;

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
      name: "Attendance Co",
      timezone: "Asia/Karachi",
      officeSchedule: alwaysOpenSchedule,
      deductionEnabled: false,
    },
    null
  );
  admin = await User.create({
    firstName: "Ad",
    lastName: "Min",
    email: "admin@att.io",
    password: await bcrypt.hash("Admin1234", 10),
    role: "admin",
    companyId: company._id,
  });
  employee = await User.create({
    firstName: "Em",
    lastName: "Plo",
    email: "emp@att.io",
    password: await bcrypt.hash("Emp12345", 10),
    role: "employee",
    companyId: company._id,
    salary: 60000,
  });
  adminToken = generateToken(admin, "admin");
  employeeToken = generateToken(employee, "employee");
});

describe("GET /attend/server-time", () => {
  it("returns the company timezone for a slug", async () => {
    const res = await request(app).get("/attend/server-time?slug=attendance-co");
    expect(res.status).toBe(200);
    expect(res.body.timezone).toBe("Asia/Karachi");
    expect(typeof res.body.serverTime).toBe("string");
    expect(typeof res.body.isAllowedTime).toBe("boolean");
  });
});

describe("attendance check-in / check-out flow", () => {
  it("checks in, then rejects a duplicate", async () => {
    const res = await request(app)
      .post(`/attend/check-in/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
    expect(res.body.attendance.checkInstatus).toBe("Present");
    expect(res.body.attendance.checkIn).toBeTruthy();

    const dup = await request(app)
      .post(`/attend/check-in/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(dup.status).toBe(400);
  });

  it("checks out after check-in", async () => {
    await request(app)
      .post(`/attend/check-in/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    const out = await request(app)
      .post(`/attend/check-out/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(out.status).toBe(200);
    expect(out.body.attendance.checkOut).toBeTruthy();
    expect([
      "Late Check-Out",
      "No Check-Out",
      "Check Out before Time",
      "Checked Out on Time",
    ]).toContain(out.body.attendance.checkOutstatus);
  });

  it("reports status after check-in/check-out", async () => {
    await request(app)
      .post(`/attend/check-in/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    const mid = await request(app)
      .get(`/attend/status/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(mid.status).toBe(200);
    expect(mid.body).toEqual({ checkedIn: true, checkedOut: false });

    await request(app)
      .post(`/attend/check-out/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    const end = await request(app)
      .get(`/attend/status/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(end.body).toEqual({ checkedIn: true, checkedOut: true });
  });

  it("lists the current month's record with salary summary", async () => {
    await request(app)
      .post(`/attend/check-in/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    const now = new Date();
    const res = await request(app)
      .get(
        `/attend/records/${employee._id}?year=${now.getFullYear()}&month=${now.getMonth() + 1}`
      )
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
    expect(res.body.records).toHaveLength(1);
    expect(res.body.records[0].checkIn).toBeTruthy();
    expect(res.body.monthlySalary).toBe(60000);
    expect(res.body.netSalary).toBe(60000);
  });

  it("lets a same-company admin check an employee in", async () => {
    const res = await request(app)
      .post(`/attend/check-in/${employee._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

describe("cross-company authorization", () => {
  it("blocks a foreign admin from checking in a different company's employee", async () => {
    const other = await createCompanyWithUniqueSlug({ name: "Other Co" }, null);
    const otherAdmin = await User.create({
      firstName: "O",
      lastName: "A",
      email: "oa@other.io",
      password: await bcrypt.hash("Admin1234", 10),
      role: "admin",
      companyId: other._id,
    });
    const otherToken = generateToken(otherAdmin, "admin");

    const res = await request(app)
      .post(`/attend/check-in/${employee._id}`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it("blocks a foreign admin from reading another company's records", async () => {
    const other = await createCompanyWithUniqueSlug({ name: "Other2 Co" }, null);
    const otherAdmin = await User.create({
      firstName: "O",
      lastName: "B",
      email: "ob@other.io",
      password: await bcrypt.hash("Admin1234", 10),
      role: "admin",
      companyId: other._id,
    });
    const otherToken = generateToken(otherAdmin, "admin");

    const res = await request(app)
      .get(`/attend/records/${employee._id}`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });
});
