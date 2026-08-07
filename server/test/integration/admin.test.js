import { createRequire } from "node:module";

// Load every local module and dependency through native require() so the
// app, models, and helpers all share a single CommonJS registry (one mongoose,
// one copy of each model). Only the vitest API itself is ESM.
const require = createRequire(import.meta.url);
const { app } = require("../helpers/app.js");
const { startDb, stopDb, clearDb } = require("../helpers/db.js");
const User = require("../../models/User.js");
const Attendance = require("../../models/Attendance.js");
const { createCompanyWithUniqueSlug } = require("../../common/onboarding.js");
const { generateToken } = require("../../utils/tokenUtils.js");
const { WEEKDAYS } = require("../../common/validation.js");
const bcrypt = require("bcryptjs");
const request = require("supertest");

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";

let company;
let admin;
let employee;
let adminToken;
let employeeToken;

// A schedule with every weekday closed is trivially valid for the validator.
const closedSchedule = Object.fromEntries(
  WEEKDAYS.map((d) => [d, { isOpen: false }])
);

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
      name: "Admin Co",
      timezone: "Asia/Karachi",
      officeSchedule: closedSchedule,
      deductionEnabled: false,
    },
    null
  );
  admin = await User.create({
    firstName: "Ad",
    lastName: "Min",
    email: "admin@admin.io",
    password: await bcrypt.hash("Admin1234", 10),
    role: "admin",
    companyId: company._id,
  });
  employee = await User.create({
    firstName: "Em",
    lastName: "Plo",
    email: "emp@admin.io",
    phone: "03001234567",
    salary: 60000,
    address: "Some Street 12",
    password: await bcrypt.hash("Emp12345", 10),
    role: "employee",
    companyId: company._id,
  });
  adminToken = generateToken(admin, "admin");
  employeeToken = generateToken(employee, "employee");
});

describe("admin authorization", () => {
  it("rejects requests without a token", async () => {
    const res = await request(app).get("/admin/user");
    expect(res.status).toBe(401);
  });

  it("rejects an employee from admin routes", async () => {
    const res = await request(app)
      .get("/admin/user")
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(res.status).toBe(403);
  });
});

describe("GET /admin/user", () => {
  it("lists only the requester's company employees", async () => {
    const other = await createCompanyWithUniqueSlug({ name: "Other Co" }, null);
    await User.create({
      firstName: "O",
      lastName: "A",
      email: "oa@other.io",
      password: await bcrypt.hash("Emp12345", 10),
      role: "employee",
      companyId: other._id,
    });

    const res = await request(app)
      .get("/admin/user")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    // getUsers returns every member of the requester's company, admin included.
    expect(res.body.employees.length).toBe(2);
    const names = res.body.employees.map((e) => e.firstName);
    const roles = res.body.employees.map((e) => e.role);
    expect(names).toContain("Em");
    expect(names).toContain("Ad");
    expect(names).not.toContain("O"); // foreign company user
    expect(roles).toContain("admin");
    expect(roles).toContain("employee");
    expect(res.body.employees[0]).toHaveProperty("isActive");
  });
});

describe("POST /admin/add", () => {
  it("creates a pending user with a setup token", async () => {
    const res = await request(app)
      .post("/admin/add")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        firstName: "New",
        lastName: "Hire",
        email: "hire@admin.io",
        phone: "03009876543",
        salary: 50000,
        address: "Office Road 5",
        role: "employee",
      });
    expect(res.status).toBe(201);
    expect(typeof res.body.emailFailed).toBe("boolean");

    const user = await User.findOne({ email: "hire@admin.io" });
    expect(user).toBeTruthy();
    expect(user.companyId.toString()).toBe(company._id.toString());
    expect(user.setupToken).toBeTruthy();
    expect(user.password).not.toBeNull();
  });

  it("rejects a duplicate email", async () => {
    const res = await request(app)
      .post("/admin/add")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        firstName: "Dup",
        lastName: "User",
        email: "emp@admin.io",
        phone: "03009876543",
        salary: 0,
        address: "Office Road 5",
        role: "employee",
      });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid phone number", async () => {
    const res = await request(app)
      .post("/admin/add")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        firstName: "Bad",
        lastName: "Phone",
        email: "badphone@admin.io",
        phone: "abc",
        salary: 0,
        address: "Office Road 5",
        role: "employee",
      });
    expect(res.status).toBe(400);
  });

  it("rejects a disallowed role", async () => {
    const res = await request(app)
      .post("/admin/add")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        firstName: "Bad",
        lastName: "Role",
        email: "badrole@admin.io",
        phone: "03009876543",
        salary: 0,
        address: "Office Road 5",
        role: "superadmin",
      });
    expect(res.status).toBe(400);
  });
});

describe("PUT /admin/edit/:id", () => {
  it("updates the user and syncs the denormalized attendance name", async () => {
    await Attendance.create({
      employee: employee._id,
      firstName: "Em",
      date: new Date(),
      companyId: company._id,
    });

    const res = await request(app)
      .put(`/admin/edit/${employee._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ firstName: "Emma" });
    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe("Emma");

    const att = await Attendance.findOne({ employee: employee._id });
    expect(att.firstName).toBe("Emma");
  });

  it("rejects editing a user in another company", async () => {
    const other = await createCompanyWithUniqueSlug({ name: "Other Co" }, null);
    const otherUser = await User.create({
      firstName: "O",
      lastName: "A",
      email: "oa@other.io",
      password: await bcrypt.hash("Emp12345", 10),
      role: "employee",
      companyId: other._id,
    });

    const res = await request(app)
      .put(`/admin/edit/${otherUser._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ firstName: "Xavier" });
    expect(res.status).toBe(403);
  });

  it("rejects taking an email owned by another user", async () => {
    const res = await request(app)
      .put(`/admin/edit/${employee._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "admin@admin.io" });
    expect(res.status).toBe(400);
  });

  it("rejects a weak password", async () => {
    const res = await request(app)
      .put(`/admin/edit/${employee._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ password: "short" });
    expect(res.status).toBe(400);
  });

  it("revokes old tokens when the role changes", async () => {
    const res = await request(app)
      .put(`/admin/edit/${employee._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "admin" });
    expect(res.status).toBe(200);

    const stale = await request(app)
      .get(`/byId/getUser/${employee._id}`)
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(stale.status).toBe(401);
  });
});

describe("DELETE /admin/delete/:id", () => {
  it("deletes the user and their attendance records", async () => {
    await Attendance.create({
      employee: employee._id,
      firstName: "Em",
      date: new Date(),
      companyId: company._id,
    });

    const res = await request(app)
      .delete(`/admin/delete/${employee._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.attendanceDeletedCount).toBe(1);

    expect(await User.findById(employee._id)).toBeNull();
    expect(await Attendance.countDocuments({ employee: employee._id })).toBe(0);
  });

  it("refuses to delete your own account", async () => {
    const res = await request(app)
      .delete(`/admin/delete/${admin._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  it("blocks a superadmin from the admin HTTP routes", async () => {
    const solo = await createCompanyWithUniqueSlug({ name: "Solo Co" }, null);
    const soloAdmin = await User.create({
      firstName: "S",
      lastName: "A",
      email: "sa@solo.io",
      password: await bcrypt.hash("Admin1234", 10),
      role: "admin",
      companyId: solo._id,
    });
    const superAdmin = await User.create({
      firstName: "S",
      lastName: "A",
      email: "sa@super.io",
      password: await bcrypt.hash("Admin1234", 10),
      role: "superadmin",
      companyId: null,
    });
    const superToken = generateToken(superAdmin, "superadmin");

    const res = await request(app)
      .delete(`/admin/delete/${soloAdmin._id}`)
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(403);
  });

  it("refuses to delete the last admin of a company", async () => {
    const { deleteUser } = require("../../controllers/adminController/adminController.js");
    const solo = await createCompanyWithUniqueSlug({ name: "Solo Co" }, null);
    const soloAdmin = await User.create({
      firstName: "S",
      lastName: "A",
      email: "sa@solo.io",
      password: await bcrypt.hash("Admin1234", 10),
      role: "admin",
      companyId: solo._id,
    });

    // Direct controller call: the HTTP route blocks superadmins before the
    // controller's last-admin guard can run, so exercise the guard in isolation.
    const req = {
      params: { id: soloAdmin._id.toString() },
      user: { id: "000000000000000000000000", role: "superadmin", companyId: null },
    };
    let statusCode;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json() {
        return this;
      },
    };
    await deleteUser(req, res);
    expect(statusCode).toBe(400);
  });

  it("rejects deleting a user in another company", async () => {
    const other = await createCompanyWithUniqueSlug({ name: "Other Co" }, null);
    const otherUser = await User.create({
      firstName: "O",
      lastName: "A",
      email: "oa@other.io",
      password: await bcrypt.hash("Emp12345", 10),
      role: "employee",
      companyId: other._id,
    });

    const res = await request(app)
      .delete(`/admin/delete/${otherUser._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });

  it("rejects a malformed user id", async () => {
    const res = await request(app)
      .delete("/admin/delete/not-an-id")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});

describe("POST /admin/resend-invite/:id", () => {
  it("regenerates a fresh setup token", async () => {
    const pending = await User.create({
      firstName: "P",
      lastName: "P",
      email: "pp@admin.io",
      password: await bcrypt.hash("Admin1234", 10),
      setupToken: "old-token",
      setupTokenExpires: new Date(),
      role: "employee",
      companyId: company._id,
    });

    const res = await request(app)
      .post(`/admin/resend-invite/${pending._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const fresh = await User.findById(pending._id);
    expect(fresh.setupToken).not.toBe("old-token");
  });

  it("returns 404 for an unknown user", async () => {
    const res = await request(app)
      .post("/admin/resend-invite/000000000000000000000000")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it("blocks resending invites for another company", async () => {
    const other = await createCompanyWithUniqueSlug({ name: "Other Co" }, null);
    const otherUser = await User.create({
      firstName: "O",
      lastName: "A",
      email: "oa@other.io",
      password: await bcrypt.hash("Emp12345", 10),
      role: "employee",
      companyId: other._id,
    });

    const res = await request(app)
      .post(`/admin/resend-invite/${otherUser._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });
});

describe("office timing", () => {
  it("lets any authenticated user read the schedule", async () => {
    const res = await request(app)
      .get("/admin/getOfficeTiming")
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(res.status).toBe(200);
    expect(res.body.schedule).toEqual(closedSchedule);
    expect(res.body.timezone).toBe("Asia/Karachi");
  });

  it("lets an admin save a valid schedule", async () => {
    const open = Object.fromEntries(
      WEEKDAYS.map((d) => [
        d,
        { isOpen: true, startTime: "09:00", endTime: "17:00" },
      ])
    );
    const res = await request(app)
      .post("/admin/saveOfficeTiming")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ schedule: open });
    expect(res.status).toBe(200);

    const read = await request(app)
      .get("/admin/getOfficeTiming")
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(read.body.schedule.Monday).toEqual({
      isOpen: true,
      startTime: "09:00",
      endTime: "17:00",
    });
  });

  it("rejects an invalid schedule", async () => {
    const res = await request(app)
      .post("/admin/saveOfficeTiming")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ schedule: { Monday: { isOpen: true, startTime: "oops" } } });
    expect(res.status).toBe(400);
  });

  it("rejects a schedule save from an employee", async () => {
    const res = await request(app)
      .post("/admin/saveOfficeTiming")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ schedule: closedSchedule });
    expect(res.status).toBe(403);
  });
});

describe("deductions settings", () => {
  it("returns the current settings", async () => {
    const res = await request(app)
      .get("/admin/getDeductions")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deductionsEnabled: false, deductionRate: 0 });
  });

  it("updates and reflects the new settings", async () => {
    const res = await request(app)
      .post("/admin/updateDeductions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ deductionsEnabled: true, deductionRate: 10 });
    expect(res.status).toBe(200);

    const read = await request(app)
      .get("/admin/getDeductions")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(read.body).toEqual({ deductionsEnabled: true, deductionRate: 10 });
  });

  it("rejects a rate out of range", async () => {
    const res = await request(app)
      .post("/admin/updateDeductions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ deductionsEnabled: true, deductionRate: 150 });
    expect(res.status).toBe(400);
  });

  it("blocks employees", async () => {
    const res = await request(app)
      .get("/admin/getDeductions")
      .set("Authorization", `Bearer ${employeeToken}`);
    expect(res.status).toBe(403);
  });
});

describe("timezone settings", () => {
  it("returns the company timezone", async () => {
    const res = await request(app)
      .get("/admin/getTime")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.timezone).toBe("Asia/Karachi");
  });

  it("updates the timezone", async () => {
    const res = await request(app)
      .post("/admin/updateTime")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ timezone: "America/New_York" });
    expect(res.status).toBe(200);

    const read = await request(app)
      .get("/admin/getTime")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(read.body.timezone).toBe("America/New_York");
  });

  it("rejects an invalid timezone", async () => {
    const res = await request(app)
      .post("/admin/updateTime")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ timezone: "Mars/Olympus" });
    expect(res.status).toBe(400);
  });
});

describe("allowed router IPs", () => {
  it("adds, lists, and removes an IP", async () => {
    const add = await request(app)
      .post("/admin/addAllowedIP")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ip: "203.0.113.7" });
    expect(add.status).toBe(200);
    expect(add.body.allowedIPs).toContain("203.0.113.7");

    const dup = await request(app)
      .post("/admin/addAllowedIP")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ip: "203.0.113.7" });
    expect(dup.status).toBe(400);

    const remove = await request(app)
      .delete("/admin/removeAllowedIP")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ip: "203.0.113.7" });
    expect(remove.status).toBe(200);
    expect(remove.body.allowedIPs).not.toContain("203.0.113.7");
  });

  it("rejects a malformed IP", async () => {
    const res = await request(app)
      .post("/admin/addAllowedIP")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ip: "999.999.999.999" });
    expect(res.status).toBe(400);
  });
});
