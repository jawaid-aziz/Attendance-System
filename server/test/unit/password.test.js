import { describe, it, expect } from "vitest";
import { isStrongPassword } from "../../common/password";

describe("isStrongPassword", () => {
  it("requires at least 8 characters", () => {
    expect(isStrongPassword("a1b2c3d")).toBe(false);
    expect(isStrongPassword("a1b2c3d4")).toBe(true);
  });

  it("requires at least one letter and one number", () => {
    expect(isStrongPassword("abcdefgh")).toBe(false);
    expect(isStrongPassword("12345678")).toBe(false);
    expect(isStrongPassword("abcd1234")).toBe(true);
  });

  it("rejects non-strings", () => {
    expect(isStrongPassword(null)).toBe(false);
    expect(isStrongPassword(undefined)).toBe(false);
    expect(isStrongPassword(12345678)).toBe(false);
  });
});
