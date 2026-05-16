import { describe, it, expect } from "vitest";
import {
  sanitizeCallbackUrl,
  getActiveLeagueId,
  isNoLeaguePlayer,
  getHomeStatsScope,
} from "../league-access";

// ─── sanitizeCallbackUrl ──────────────────────────────────────────────────────

describe("sanitizeCallbackUrl", () => {
  it("returns / when input is undefined", () => {
    expect(sanitizeCallbackUrl(undefined)).toBe("/");
  });

  it("returns / when input is empty string", () => {
    expect(sanitizeCallbackUrl("")).toBe("/");
  });

  it("passes through the root path", () => {
    expect(sanitizeCallbackUrl("/")).toBe("/");
  });

  it("passes through a valid relative path", () => {
    expect(sanitizeCallbackUrl("/league/letsplay")).toBe("/league/letsplay");
  });

  it("passes through a relative path with query string", () => {
    expect(sanitizeCallbackUrl("/leaderboard?league=abc123")).toBe(
      "/leaderboard?league=abc123"
    );
  });

  it("rejects an absolute URL (http)", () => {
    expect(sanitizeCallbackUrl("https://evil.com")).toBe("/");
  });

  it("rejects an absolute URL (http no www)", () => {
    expect(sanitizeCallbackUrl("http://phishing.io/steal")).toBe("/");
  });

  it("rejects a protocol-relative URL (// prefix)", () => {
    // "//evil.com" starts with "/" but is still an open redirect
    expect(sanitizeCallbackUrl("//evil.com")).toBe("/");
  });

  it("rejects a URL without scheme that looks external", () => {
    expect(sanitizeCallbackUrl("evil.com/path")).toBe("/");
  });
});

// ─── getActiveLeagueId ───────────────────────────────────────────────────────

const L1 = { id: "league-1" };
const L2 = { id: "league-2" };

describe("getActiveLeagueId — admin", () => {
  it("returns undefined when no league param (admin sees all)", () => {
    expect(getActiveLeagueId(undefined, [], true)).toBeUndefined();
  });

  it("returns the URL param when present", () => {
    expect(getActiveLeagueId("league-x", [], true)).toBe("league-x");
  });

  it("ignores the user's own leagues — admins use the URL param only", () => {
    expect(getActiveLeagueId(undefined, [L1, L2], true)).toBeUndefined();
  });
});

describe("getActiveLeagueId — player", () => {
  it("returns undefined when player has no leagues and no URL param", () => {
    // caller is responsible for guarding with isNoLeaguePlayer
    expect(getActiveLeagueId(undefined, [], false)).toBeUndefined();
  });

  it("defaults to the first league when player has one league", () => {
    expect(getActiveLeagueId(undefined, [L1], false)).toBe("league-1");
  });

  it("defaults to the first league when player has multiple leagues", () => {
    expect(getActiveLeagueId(undefined, [L1, L2], false)).toBe("league-1");
  });

  it("URL param overrides the default league", () => {
    expect(getActiveLeagueId("league-2", [L1, L2], false)).toBe("league-2");
  });

  it("URL param is used even when player is in no leagues", () => {
    // Allows viewing a league leaderboard via direct URL
    expect(getActiveLeagueId("league-x", [], false)).toBe("league-x");
  });
});

// ─── isNoLeaguePlayer ────────────────────────────────────────────────────────

describe("isNoLeaguePlayer", () => {
  it("is false for an admin with no leagues", () => {
    expect(isNoLeaguePlayer([], true)).toBe(false);
  });

  it("is false for an admin with leagues", () => {
    expect(isNoLeaguePlayer([L1], true)).toBe(false);
  });

  it("is true for a player with no leagues", () => {
    expect(isNoLeaguePlayer([], false)).toBe(true);
  });

  it("is false for a player in one league", () => {
    expect(isNoLeaguePlayer([L1], false)).toBe(false);
  });

  it("is false for a player in multiple leagues", () => {
    expect(isNoLeaguePlayer([L1, L2], false)).toBe(false);
  });
});

// ─── getHomeStatsScope ───────────────────────────────────────────────────────

describe("getHomeStatsScope", () => {
  it("returns null for a guest (no userId)", () => {
    expect(getHomeStatsScope(undefined, false, [])).toBeNull();
  });

  it("returns null for an admin — admins see global totals", () => {
    expect(getHomeStatsScope("admin-id", true, ["l1"])).toBeNull();
  });

  it("returns empty array for a player with no leagues → shows 0", () => {
    expect(getHomeStatsScope("user-id", false, [])).toEqual([]);
  });

  it("returns the player's league IDs when they have leagues", () => {
    expect(getHomeStatsScope("user-id", false, ["l1", "l2"])).toEqual([
      "l1",
      "l2",
    ]);
  });

  it("returns a single-element array for a player in exactly one league", () => {
    expect(getHomeStatsScope("user-id", false, ["l1"])).toEqual(["l1"]);
  });
});
