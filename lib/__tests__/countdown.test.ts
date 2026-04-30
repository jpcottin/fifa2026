import { describe, it, expect } from "vitest";
import { rawDaysUntil } from "../countdown";

const jun11 = new Date("2026-06-11");
const jul19 = new Date("2026-07-19");

describe("rawDaysUntil", () => {
  it("returns 0 on the target day itself", () => {
    expect(rawDaysUntil(jun11, jun11)).toBe(0);
  });

  it("returns a positive number before the target", () => {
    const today = new Date("2026-04-29");
    expect(rawDaysUntil(jun11, today)).toBe(43);
  });

  it("returns 1 the day before the target", () => {
    const dayBefore = new Date("2026-06-10");
    expect(rawDaysUntil(jun11, dayBefore)).toBe(1);
  });

  it("returns a negative number after the target", () => {
    const dayAfter = new Date("2026-06-12");
    expect(rawDaysUntil(jun11, dayAfter)).toBe(-1);
  });

  it("works correctly for the Final date", () => {
    const today = new Date("2026-04-29");
    expect(rawDaysUntil(jul19, today)).toBe(81);
  });

  it("is negative after the Final", () => {
    const dayAfterFinal = new Date("2026-07-20");
    expect(rawDaysUntil(jul19, dayAfterFinal)).toBe(-1);
  });
});
