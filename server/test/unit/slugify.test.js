import { describe, it, expect } from "vitest";
import { slugify } from "../../common/slugify";

describe("slugify", () => {
  it("lowercases and trims", () => {
    expect(slugify("  Tech House  ")).toBe("tech-house");
  });

  it("replaces non-alphanumeric runs with a single dash", () => {
    expect(slugify("Tech House Ltd.")).toBe("tech-house-ltd");
    expect(slugify("A & B Corp")).toBe("a-b-corp");
  });

  it("strips leading/trailing dashes", () => {
    expect(slugify("  !!!Tech!!!  ")).toBe("tech");
  });

  it("falls back to empty string for empty input", () => {
    expect(slugify("")).toBe("");
    expect(slugify(undefined)).toBe("");
  });
});
