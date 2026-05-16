import { describe, it, expect } from "vitest";
import { normalizeSlug, isValidSlug } from "../leagues";

describe("normalizeSlug", () => {
  it("lowercases input", () => {
    expect(normalizeSlug("OTV")).toBe("otv");
  });

  it("replaces spaces with hyphens", () => {
    expect(normalizeSlug("Let s Play")).toBe("let-s-play");
  });

  it("strips special characters", () => {
    expect(normalizeSlug("Let's Play!")).toBe("let-s-play");
  });

  it("collapses multiple hyphens", () => {
    expect(normalizeSlug("foo---bar")).toBe("foo-bar");
  });

  it("strips leading and trailing hyphens", () => {
    expect(normalizeSlug("--foo--")).toBe("foo");
  });

  it("truncates to 32 characters", () => {
    const long = "a".repeat(50);
    expect(normalizeSlug(long)).toHaveLength(32);
  });

  it("handles typical league names", () => {
    expect(normalizeSlug("LetsPlay")).toBe("letsplay");
    expect(normalizeSlug("OTV 2026")).toBe("otv-2026");
  });
});

describe("isValidSlug", () => {
  it("accepts simple lowercase slug", () => {
    expect(isValidSlug("otv")).toBe(true);
  });

  it("accepts slug with hyphens", () => {
    expect(isValidSlug("lets-play")).toBe(true);
  });

  it("accepts slug with numbers", () => {
    expect(isValidSlug("league1")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidSlug("")).toBe(false);
  });

  it("rejects slug with uppercase", () => {
    expect(isValidSlug("OTV")).toBe(false);
  });

  it("rejects slug with special characters", () => {
    expect(isValidSlug("let's-play")).toBe(false);
  });

  it("rejects slug longer than 32 chars", () => {
    expect(isValidSlug("a".repeat(33))).toBe(false);
  });

  it("rejects slug with leading hyphen", () => {
    expect(isValidSlug("-foo")).toBe(false);
  });

  it("rejects slug with trailing hyphen", () => {
    expect(isValidSlug("foo-")).toBe(false);
  });
});
