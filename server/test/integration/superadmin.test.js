import { createRequire } from "node:module";

// Load every local module and dependency through native require() so the
// app, models, and helpers all share a single CommonJS registry (one mongoose,
// one copy of each model). Only the vitest API itself is ESM.
const require = createRequire(import.meta.url);
const { app } = require("../helpers/app.js");
const { startDb, stopDb, clearDb } = require("../helpers/db.js");
const User = require("../../models/User.js");
const Company = require("../../models/Company.js");
const { createCompanyWithUniqueSlug } = require("../../common/onboarding.js");
const { generateToken } = require("../../utils/tokenUtils.js");
const bcrypt = require("bcryptjs");
const request = require("supertest");

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";

let superAdmin;
let admin;
let superToken;

beforeAll(async () => {
  await startDb();
});
afterAll(async () => {
  await stopDb();
});
beforeEach(async () => {
  await clearDb();

  superAdmin = await User.create({
    firstName: "S",
    lastName: "A",
    email: "sa@super.io",
    password: await bcrypt.hash("Admin1234", 10),
    role: "superadmin",
    companyId: null,
  });
  const company = await createCompanyWithUniqueSlug({ name: "Base Co" }, null);
  admin = await User.create({
    firstName: "B",
    lastName: "A",
    email: "ba@base.io",
    password: await bcrypt.hash("Admin1234", 10),
    role: "admin",
    companyId: company._id,
  });
  superToken = generateToken(superAdmin, "superadmin");
});

const adminToken = () => generateToken(admin, "admin");

describe("superadmin authorization", () => {
  it("rejects requests without a token", async () => {
    const res = await request(app).get("/superadmin/companies");
    expect(res.status).toBe(401);
  });

  it("rejects a company admin", async () => {
    const res = await request(app)
      .get("/superadmin/companies")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(403);
  });
});

describe("GET /superadmin/companies", () => {
  it("lists active companies with member counts", async () => {
    const a = await createCompanyWithUniqueSlug({ name: "Alpha Co" }, null);
    await User.create({
      firstName: "A1",
      lastName: "U",
      email: "a1@alpha.io",
      password: await bcrypt.hash("Emp12345", 10),
      role: "employee",
      companyId: a._id,
    });
    await User.create({
      firstName: "A2",
      lastName: "U",
      email: "a2@alpha.io",
      password: await bcrypt.hash("Emp12345", 10),
      role: "employee",
      companyId: a._id,
    });

    const res = await request(app)
      .get("/superadmin/companies")
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    const names = res.body.companies.map((c) => c.name);
    expect(names).toContain("Base Co");
    expect(names).toContain("Alpha Co");
    const alpha = res.body.companies.find((c) => c.name === "Alpha Co");
    expect(alpha.members).toBe(2);
  });

  it("returns the primary admin for each company", async () => {
    const res = await request(app)
      .get("/superadmin/companies")
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    const base = res.body.companies.find((c) => c.name === "Base Co");
    expect(base.adminName).toBe("B A");
    expect(base.adminEmail).toBe("ba@base.io");
  });

  it("excludes deleted companies", async () => {
    const doomed = await createCompanyWithUniqueSlug({ name: "Doomed Co" }, null);
    await request(app)
      .delete(`/superadmin/companies/${doomed._id}`)
      .set("Authorization", `Bearer ${superToken}`);

    const res = await request(app)
      .get("/superadmin/companies")
      .set("Authorization", `Bearer ${superToken}`);
    const names = res.body.companies.map((c) => c.name);
    expect(names).not.toContain("Doomed Co");
  });
});

describe("GET /superadmin/companies/:id", () => {
  it("returns a company by id with its users", async () => {
    const company = await createCompanyWithUniqueSlug({ name: "Detail Co" }, null);
    const res = await request(app)
      .get(`/superadmin/companies/${company._id}`)
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(res.body.company.slug).toBe("detail-co");
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it("resolves by slug", async () => {
    const company = await createCompanyWithUniqueSlug({ name: "Detail Co" }, null);
    const res = await request(app)
      .get(`/superadmin/companies/${company.slug}`)
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(res.body.company.id).toBe(company._id.toString());
  });

  it("returns 404 for a deleted company", async () => {
    const doomed = await createCompanyWithUniqueSlug({ name: "Gone Co" }, null);
    await request(app)
      .delete(`/superadmin/companies/${doomed._id}`)
      .set("Authorization", `Bearer ${superToken}`);

    const res = await request(app)
      .get(`/superadmin/companies/${doomed._id}`)
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(404);
  });
});

describe("POST /superadmin/companies", () => {
  it("creates a company with a pending admin and setup link", async () => {
    const res = await request(app)
      .post("/superadmin/companies")
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        name: "Created Co",
        totalEmployees: 25,
        timezone: "Asia/Karachi",
        adminFirstName: "C",
        adminLastName: "Admin",
        adminEmail: "ca@created.io",
      });
    expect(res.status).toBe(201);
    expect(res.body.company.name).toBe("Created Co");
    expect(res.body.admin.email).toBe("ca@created.io");
    expect(res.body.admin.setupLink).toContain("/setup/");

    const user = await User.findOne({ email: "ca@created.io" });
    expect(user).toBeTruthy();
    expect(user.role).toBe("admin");
    expect(user.companyId.toString()).toBe(res.body.company.id);
  });

  it("creates a company without an admin", async () => {
    const res = await request(app)
      .post("/superadmin/companies")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ name: "NoAdmin Co" });
    expect(res.status).toBe(201);
    expect(res.body.admin).toBeNull();
  });

  it("appends a suffix when the slug is taken", async () => {
    await createCompanyWithUniqueSlug({ name: "Taken Co" }, null);
    const res = await request(app)
      .post("/superadmin/companies")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ name: "Taken Co" });
    expect(res.status).toBe(201);
    expect(res.body.company.slug).toBe("taken-co-2");
  });

  it("rejects an invalid admin email", async () => {
    const res = await request(app)
      .post("/superadmin/companies")
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        name: "Bad Email Co",
        adminFirstName: "C",
        adminEmail: "not-an-email",
      });
    expect(res.status).toBe(400);
  });

  it("rejects admin fields provided incompletely", async () => {
    const res = await request(app)
      .post("/superadmin/companies")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ name: "Partial Co", adminEmail: "x@partial.io" });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /superadmin/companies/:id/status", () => {
  it("suspends and reactivates a company", async () => {
    const company = await createCompanyWithUniqueSlug({ name: "Status Co" }, null);

    const suspend = await request(app)
      .patch(`/superadmin/companies/${company._id}/status`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ status: "suspended" });
    expect(suspend.status).toBe(200);
    expect(suspend.body.company.status).toBe("suspended");

    const activate = await request(app)
      .patch(`/superadmin/companies/${company._id}/status`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ status: "active" });
    expect(activate.body.company.status).toBe("active");
  });

  it("rejects an invalid status", async () => {
    const company = await createCompanyWithUniqueSlug({ name: "Bad Status Co" }, null);
    const res = await request(app)
      .patch(`/superadmin/companies/${company._id}/status`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ status: "on-fire" });
    expect(res.status).toBe(400);
  });

  it("cannot change the status of a deleted company", async () => {
    const doomed = await createCompanyWithUniqueSlug({ name: "Dead Co" }, null);
    await request(app)
      .delete(`/superadmin/companies/${doomed._id}`)
      .set("Authorization", `Bearer ${superToken}`);

    const res = await request(app)
      .patch(`/superadmin/companies/${doomed._id}/status`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ status: "active" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /superadmin/companies/:id", () => {
  it("soft-deletes a company", async () => {
    const company = await createCompanyWithUniqueSlug({ name: "Soft Delete Co" }, null);
    const res = await request(app)
      .delete(`/superadmin/companies/${company._id}`)
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(res.body.company.status).toBe("deleted");

    const stored = await Company.findById(company._id);
    expect(stored.status).toBe("deleted");
  });

  it("returns 404 for an unknown company", async () => {
    const res = await request(app)
      .delete("/superadmin/companies/000000000000000000000000")
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(404);
  });
});

describe("POST /superadmin/invite-superadmin", () => {
  it("creates a pending superadmin", async () => {
    const res = await request(app)
      .post("/superadmin/invite-superadmin")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ firstName: "New", lastName: "Super", email: "ns@super.io" });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("superadmin");

    const user = await User.findOne({ email: "ns@super.io" });
    expect(user.setupToken).toBeTruthy();
  });

  it("rejects a duplicate email", async () => {
    const res = await request(app)
      .post("/superadmin/invite-superadmin")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ firstName: "Dup", lastName: "Super", email: "sa@super.io" });
    expect(res.status).toBe(400);
  });

  it("requires all fields", async () => {
    const res = await request(app)
      .post("/superadmin/invite-superadmin")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ email: "only@super.io" });
    expect(res.status).toBe(400);
  });
});

describe("GET /superadmin/admins", () => {
  it("lists superadmins", async () => {
    const res = await request(app)
      .get("/superadmin/admins")
      .set("Authorization", `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    const emails = res.body.superAdmins.map((u) => u.email);
    expect(emails).toContain("sa@super.io");
  });
});
