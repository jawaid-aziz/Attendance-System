import { createRequire } from "node:module";

// Load every local module and dependency through native require() so the
// app, models, and helpers all share a single CommonJS registry (one mongoose,
// one copy of each model). Only the vitest API itself is ESM.
const require = createRequire(import.meta.url);
const { startDb, stopDb, clearDb } = require("../helpers/db.js");
const { createCompanyWithUniqueSlug } = require("../../common/onboarding.js");
const validateOfficeIP = require("../../middleware/validateIP.js");

import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";

const makeRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
};

const makeReq = (companyId, ip) => ({
  user: { companyId },
  headers: ip ? { "x-forwarded-for": ip } : {},
  socket: { remoteAddress: "203.0.113.9" },
});

beforeAll(async () => {
  await startDb();
});
afterAll(async () => {
  await stopDb();
});
beforeEach(async () => {
  await clearDb();
  process.env.IP_ENFORCEMENT = "off";
});

describe("validateOfficeIP", () => {
  it("allows through when enforcement is off and records the client IP", async () => {
    const company = await createCompanyWithUniqueSlug(
      { name: "IP Co", allowedRouterIPs: ["203.0.113.7"] },
      null
    );
    const req = makeReq(company._id, "198.51.100.4");
    const res = makeRes();
    const next = vi.fn();

    await validateOfficeIP(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.clientIP).toBe("198.51.100.4");
    expect(req.company._id.toString()).toBe(company._id.toString());
  });

  it("allows a caller on the allowed list in strict mode", async () => {
    process.env.IP_ENFORCEMENT = "strict";
    const company = await createCompanyWithUniqueSlug(
      { name: "IP Co", allowedRouterIPs: ["203.0.113.7"] },
      null
    );
    const req = makeReq(company._id, "203.0.113.7");
    const res = makeRes();
    const next = vi.fn();

    await validateOfficeIP(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("falls back to the socket remote address", async () => {
    process.env.IP_ENFORCEMENT = "strict";
    const company = await createCompanyWithUniqueSlug(
      { name: "IP Co", allowedRouterIPs: ["203.0.113.9"] },
      null
    );
    const req = makeReq(company._id, null); // no forwarded header
    const res = makeRes();
    const next = vi.fn();

    await validateOfficeIP(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("blocks a caller not on the allowed list in strict mode", async () => {
    process.env.IP_ENFORCEMENT = "strict";
    const company = await createCompanyWithUniqueSlug(
      { name: "IP Co", allowedRouterIPs: ["203.0.113.7"] },
      null
    );
    const req = makeReq(company._id, "198.51.100.4");
    const res = makeRes();
    const next = vi.fn();

    await validateOfficeIP(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("blocks in strict mode when no allowed IPs are configured", async () => {
    process.env.IP_ENFORCEMENT = "strict";
    const company = await createCompanyWithUniqueSlug(
      { name: "IP Co", allowedRouterIPs: [] },
      null
    );
    const req = makeReq(company._id, "203.0.113.7");
    const res = makeRes();
    const next = vi.fn();

    await validateOfficeIP(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a requester without a company", async () => {
    const req = makeReq(null, "203.0.113.7");
    const res = makeRes();
    const next = vi.fn();

    await validateOfficeIP(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a suspended company", async () => {
    const company = await createCompanyWithUniqueSlug(
      { name: "IP Co", status: "suspended" },
      null
    );
    const req = makeReq(company._id, "203.0.113.7");
    const res = makeRes();
    const next = vi.fn();

    await validateOfficeIP(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
