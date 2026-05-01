import { describe, it, expect } from "vitest";
import { splitMatchCounts } from "../match-stats";

describe("splitMatchCounts", () => {
  it("returns zeros for empty input", () => {
    expect(splitMatchCounts([])).toEqual({ played: 0, upcoming: 0 });
  });

  it("counts all as upcoming when no results yet", () => {
    expect(splitMatchCounts(["UPCOMING", "UPCOMING", "UPCOMING"])).toEqual({ played: 0, upcoming: 3 });
  });

  it("counts all as played when no upcoming remain", () => {
    expect(splitMatchCounts(["TEAM1", "TEAM2", "DRAW"])).toEqual({ played: 3, upcoming: 0 });
  });

  it("splits correctly with mixed results", () => {
    expect(splitMatchCounts(["TEAM1", "UPCOMING", "DRAW", "UPCOMING", "TEAM2"])).toEqual({ played: 3, upcoming: 2 });
  });

  it("treats DRAW as played", () => {
    expect(splitMatchCounts(["DRAW"])).toEqual({ played: 1, upcoming: 0 });
  });
});
