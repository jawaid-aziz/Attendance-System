import { createRequire } from "node:module";

// Load every local module and dependency through native require() so the
// app, models, and helpers all share a single CommonJS registry (one mongoose,
// one copy of each model). Only the vitest API itself is ESM.
const require = createRequire(import.meta.url);
const { app } = require("../helpers/app.js");
const { startDb, stopDb, clearDb } = require("../helpers/db.js");
const User = require("../../models/User.js");
const {
  createCompanyWithUniqueSlug,
  createUserWithSetupToken,
} = require("../../common/onboarding.js");
const { generateToken } = require("../../utils/tokenUtils.js");
const bcrypt = require("bcryptjs");
const request = require("supertest");

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";

beforeAll(async () => {
  await startDb();
});
afterAll(async () => {
  await stopDb();
});
beforeEach(async () => {
  await clearDb();
});

describe("GET /health", () => {
  it("reports ok when connected", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.db).toBe("connected");
  });
});

describe("POST /auth/register", () => {
  it("creates a company and a pending admin", async () => {
    const res = await request(app).post("/auth/register").send({
      companyName: "Acme Corp",
      adminFirstName: "Ada",
      adminLastName: "Lovelace",
      adminEmail: "ada@acme.test",
      timezone: "Asia/Karachi",
    });
    expect(res.status).toBe(201);
    expect(res.body.company.name).toBe("Acme Corp");
    expect(res.body.company.slug).toBe("acme-corp");
    expect(res.body.admin.email).toBe("ada@acme.test");
    expect(typeof res.body.emailFailed).toBe("boolean");

    const user = await User.findOne({ email: "ada@acme.test" });
    expect(user).toBeTruthy();
    expect(user.role).toBe("admin");
    expect(user.setupToken).toBeTruthy();
  });

  it("rejects a duplicate admin email", async () => {
    await createCompanyWithUniqueSlug({ name: "First Co" }, null);
    await createUserWithSetupToken(
      {
        firstName: "X",
        lastName: "Y",
        email: "dup@test.io",
        phone: "",
        salary: 0,
        address: "",
        role: "admin",
        companyId: null,
      },
      null
    );
    const res = await request(app).post("/auth/register").send({
      companyName: "Second Co",
      adminFirstName: "X",
      adminEmail: "dup@test.io",
    });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid timezone", async () => {
    const res = await request(app).post("/auth/register").send({
      companyName: "Acme",
      adminFirstName: "A",
      adminEmail: "a@acme.test",
      timezone: "Mars/Olympus",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a missing company name", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ adminFirstName: "A", adminEmail: "a@acme.test" });
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/setup/:token", () => {
  it("sets a password and returns a session token", async () => {
    const company = await createCompanyWithUniqueSlug(
      { name: "Setup Co" },
      null
    );
    const { user, setupToken } = await createUserWithSetupToken(
      {
        firstName: "Bob",
        lastName: "Builder",
        email: "bob@setup.io",
        phone: "",
        salary: 1000,
        address: "",
        role: "employee",
        companyId: company._id,
      },
      null
    );
    const res = await request(app)
      .post(`/auth/setup/${setupToken}`)
      .send({ password: "NewPass123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.slug).toBe("setup-co");
    expect(res.body.user.email).toBe("bob@setup.io");

    const fresh = await User.findById(user._id);
    expect(fresh.setupToken).toBeNull();
  });

  it("rejects an unknown token", async () => {
    const res = await request(app)
      .post("/auth/setup/deadbeef")
      .send({ password: "NewPass123" });
    expect(res.status).toBe(404);
  });

  it("rejects an expired token", async () => {
    const { user, setupToken } = await createUserWithSetupToken(
      {
        firstName: "E",
        lastName: "X",
        email: "exp@setup.io",
        phone: "",
        salary: 0,
        address: "",
        role: "employee",
        companyId: null,
      },
      null
    );
    await User.updateOne(
      { _id: user._id },
      { $set: { setupTokenExpires: new Date(Date.now() - 1000) } }
    );
    const res = await request(app)
      .post(`/auth/setup/${setupToken}`)
      .send({ password: "NewPass123" });
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  it("returns the same 401 for unknown user and wrong password", async () => {
    const unknown = await request(app)
      .post("/auth/login")
      .send({ email: "ghost@x.io", password: "WrongPass1" });
    const wrong = await request(app)
      .post("/auth/login")
      .send({ email: "ghost@x.io", password: "WrongPass2" });
    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body.message).toBe(wrong.body.message);
    expect(unknown.body.message).toBe("Invalid email or password");
  });

  it("logs in an activated user and returns their company slug", async () => {
    const company = await createCompanyWithUniqueSlug(
      { name: "Login Co" },
      null
    );
    await createUserWithSetupToken(
      {
        firstName: "Sam",
        lastName: "Smith",
        email: "sam@login.io",
        phone: "",
        salary: 1000,
        address: "",
        role: "employee",
        companyId: company._id,
      },
      null
    );
    await User.updateOne(
      { email: "sam@login.io" },
      {
        $set: {
          password: await bcrypt.hash("Passw0rd!", 10),
          setupToken: null,
        },
      }
    );
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "sam@login.io", password: "Passw0rd!" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.slug).toBe("login-co");
    expect(res.body.user.role).toBe("employee");
  });

  it("rejects login when the tenant slug does not match", async () => {
    const company = await createCompanyWithUniqueSlug(
      { name: "Slug Co" },
      null
    );
    await createUserWithSetupToken(
      {
        firstName: "T",
        lastName: "U",
        email: "tu@slug.io",
        phone: "",
        salary: 0,
        address: "",
        role: "employee",
        companyId: company._id,
      },
      null
    );
    await User.updateOne(
      { email: "tu@slug.io" },
      {
        $set: {
          password: await bcrypt.hash("Passw0rd!", 10),
          setupToken: null,
        },
      }
    );
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "tu@slug.io", password: "Passw0rd!", slug: "wrong-slug" });
    expect(res.status).toBe(403);
  });

  it("blocks login for a suspended company", async () => {
    const company = await createCompanyWithUniqueSlug(
      { name: "Sus Co", status: "suspended" },
      null
    );
    await createUserWithSetupToken(
      {
        firstName: "S",
        lastName: "S",
        email: "ss@sus.io",
        phone: "",
        salary: 0,
        address: "",
        role: "employee",
        companyId: company._id,
      },
      null
    );
    await User.updateOne(
      { email: "ss@sus.io" },
      {
        $set: {
          password: await bcrypt.hash("Passw0rd!", 10),
          setupToken: null,
        },
      }
    );
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "ss@sus.io", password: "Passw0rd!" });
    expect(res.status).toBe(403);
  });
});

describe("POST /auth/change-password", () => {
  it("rotates the password and invalidates old tokens", async () => {
    const company = await createCompanyWithUniqueSlug(
      { name: "PW Co" },
      null
    );
    const user = await User.create({
      firstName: "P",
      lastName: "W",
      email: "pw@x.io",
      password: await bcrypt.hash("OldPass123", 10),
      role: "employee",
      companyId: company._id,
    });
    const oldToken = generateToken(user, user.role);

    const ok = await request(app)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${oldToken}`)
      .send({ currentPassword: "OldPass123", newPassword: "NewPass456" });
    expect(ok.status).toBe(200);

    const replay = await request(app)
      .get(`/byId/getUser/${user._id}`)
      .set("Authorization", `Bearer ${oldToken}`);
    expect(replay.status).toBe(401);
  });
});

describe("POST /auth/forgot-password", () => {
  it("creates a reset token and replies identically for unknown emails", async () => {
    await createUserWithSetupToken(
      {
        firstName: "F",
        lastName: "P",
        email: "forgot@x.io",
        phone: "",
        salary: 0,
        address: "",
        role: "employee",
        companyId: null,
      },
      null
    );

    const existing = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "forgot@x.io" });
    const unknown = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "ghost@x.io" });

    expect(existing.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(existing.body.message).toBe(unknown.body.message);

    const user = await User.findOne({ email: "forgot@x.io" });
    expect(user.resetToken).toBeTruthy();
    expect(user.resetTokenExpires).toBeTruthy();
  });

  it("rejects a malformed email", async () => {
    const res = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "not-an-email" });
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/reset-password/:token", () => {
  const makeUserWithReset = async (email) => {
    const user = await User.create({
      firstName: "R",
      lastName: "S",
      email,
      password: await bcrypt.hash("OldPass123", 10),
      role: "employee",
      companyId: null,
      resetToken: "reset-token-123",
      resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
    });
    return user;
  };

  it("resets the password, clears the token, and lets the user log in", async () => {
    await makeUserWithReset("resetok@x.io");

    const res = await request(app)
      .post("/auth/reset-password/reset-token-123")
      .send({ password: "BrandNew456" });
    expect(res.status).toBe(200);

    const user = await User.findOne({ email: "resetok@x.io" });
    expect(user.resetToken).toBeNull();
    expect(user.resetTokenExpires).toBeNull();

    const login = await request(app)
      .post("/auth/login")
      .send({ email: "resetok@x.io", password: "BrandNew456" });
    expect(login.status).toBe(200);
  });

  it("rejects an unknown token", async () => {
    const res = await request(app)
      .post("/auth/reset-password/nope")
      .send({ password: "BrandNew456" });
    expect(res.status).toBe(404);
  });

  it("rejects an expired token", async () => {
    await User.create({
      firstName: "E",
      lastName: "X",
      email: "resetexp@x.io",
      password: await bcrypt.hash("OldPass123", 10),
      role: "employee",
      companyId: null,
      resetToken: "reset-token-expired",
      resetTokenExpires: new Date(Date.now() - 1000),
    });

    const res = await request(app)
      .post("/auth/reset-password/reset-token-expired")
      .send({ password: "BrandNew456" });
    expect(res.status).toBe(400);
  });
});
