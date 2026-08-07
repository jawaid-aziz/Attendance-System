import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import { generateToken } from "../../utils/tokenUtils";

const SECRET = "test-secret-that-is-longer-than-thirty-two-characters!";

describe("generateToken", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  it("produces a 5h token with the expected payload", () => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      companyId: "c1",
      version: 2,
    };
    const token = generateToken(user, "admin");
    const decoded = jwt.verify(token, SECRET);
    expect(decoded.id).toBe(user._id);
    expect(decoded.role).toBe("admin");
    expect(decoded.companyId).toBe("c1");
    expect(decoded.version).toBe(2);
    expect(decoded.exp - decoded.iat).toBe(5 * 60 * 60);
  });

  it("defaults version to 0 when missing", () => {
    const user = { _id: "507f1f77bcf86cd799439011", companyId: null };
    const token = generateToken(user, "employee");
    const decoded = jwt.verify(token, SECRET);
    expect(decoded.version).toBe(0);
    expect(decoded.companyId).toBeNull();
  });
});
