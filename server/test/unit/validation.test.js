import { describe, it, expect } from "vitest";
import {
  isValidOfficeSchedule,
  isValidTimezone,
  WEEKDAYS,
} from "../../common/validation";

describe("isValidOfficeSchedule", () => {
  it("accepts a full valid weekly schedule", () => {
    const schedule = Object.fromEntries(
      WEEKDAYS.map((d) => [
        d,
        { isOpen: true, startTime: "10:00", endTime: "18:00" },
      ])
    );
    expect(isValidOfficeSchedule(schedule)).toBe(true);
  });

  it("accepts closed days without times", () => {
    const schedule = { Monday: { isOpen: false } };
    expect(isValidOfficeSchedule(schedule)).toBe(true);
  });

  it("rejects non-object input", () => {
    expect(isValidOfficeSchedule(null)).toBe(false);
    expect(isValidOfficeSchedule("x")).toBe(false);
    expect(isValidOfficeSchedule([])).toBe(false);
  });

  it("rejects unknown weekday keys", () => {
    expect(isValidOfficeSchedule({ Someday: { isOpen: false } })).toBe(false);
  });

  it("rejects open days missing times or with malformed times", () => {
    expect(
      isValidOfficeSchedule({
        Monday: { isOpen: true, startTime: "25:00", endTime: "18:00" },
      })
    ).toBe(false);
    expect(
      isValidOfficeSchedule({ Monday: { isOpen: true, startTime: "10:00" } })
    ).toBe(false);
    expect(isValidOfficeSchedule({ Monday: { isOpen: "yes" } })).toBe(false);
  });
});

describe("isValidTimezone", () => {
  it("accepts known IANA zones", () => {
    expect(isValidTimezone("Asia/Karachi")).toBe(true);
    expect(isValidTimezone("UTC")).toBe(true);
    expect(isValidTimezone("America/New_York")).toBe(true);
  });

  it("rejects unknown or malformed zones", () => {
    expect(isValidTimezone("Not/AZone")).toBe(false);
    expect(isValidTimezone("")).toBe(false);
    expect(isValidTimezone(null)).toBe(false);
    expect(isValidTimezone(123)).toBe(false);
  });
});
