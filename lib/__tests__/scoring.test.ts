import { describe, it, expect } from "vitest";
import {
  goalMultiplier,
  computeTeamScores,
  computeSelectionScore,
} from "../scoring";

describe("goalMultiplier", () => {
  it("returns 0.3 for GROUP phase", () => {
    expect(goalMultiplier("GROUP")).toBe(0.3);
  });

  it("returns 0.5 for all knockout phases", () => {
    for (const phase of ["R32", "R16", "QF", "SF", "THIRD", "FINAL"] as const) {
      expect(goalMultiplier(phase)).toBe(0.5);
    }
  });
});

describe("computeTeamScores", () => {
  it("awards 3 points to the winning team", () => {
    const scores = computeTeamScores([
      { team1Id: "a", team2Id: "b", team1Goals: 0, team2Goals: 0, winner: "TEAM1", phase: "GROUP" },
    ]);
    expect(scores.get("a")).toBe(3);
    expect(scores.get("b")).toBe(0);
  });

  it("awards 1 point to each team on a draw", () => {
    const scores = computeTeamScores([
      { team1Id: "a", team2Id: "b", team1Goals: 1, team2Goals: 1, winner: "DRAW", phase: "GROUP" },
    ]);
    // 1 point for draw + 1 goal × 0.3 = 1.3
    expect(scores.get("a")).toBeCloseTo(1.3);
    expect(scores.get("b")).toBeCloseTo(1.3);
  });

  it("adds 0.3 per goal in group phase", () => {
    const scores = computeTeamScores([
      { team1Id: "a", team2Id: "b", team1Goals: 3, team2Goals: 1, winner: "TEAM1", phase: "GROUP" },
    ]);
    // a: 3 (win) + 3×0.3 = 3.9
    expect(scores.get("a")).toBeCloseTo(3.9);
    // b: 0 (loss) + 1×0.3 = 0.3
    expect(scores.get("b")).toBeCloseTo(0.3);
  });

  it("adds 0.5 per goal in knockout phase", () => {
    const scores = computeTeamScores([
      { team1Id: "a", team2Id: "b", team1Goals: 2, team2Goals: 0, winner: "TEAM1", phase: "QF" },
    ]);
    // a: 3 (win) + 2×0.5 = 4
    expect(scores.get("a")).toBeCloseTo(4);
    expect(scores.get("b")).toBe(0);
  });

  it("accumulates scores across multiple matches", () => {
    const scores = computeTeamScores([
      { team1Id: "a", team2Id: "b", team1Goals: 1, team2Goals: 0, winner: "TEAM1", phase: "GROUP" },
      { team1Id: "a", team2Id: "c", team1Goals: 2, team2Goals: 2, winner: "DRAW",  phase: "GROUP" },
    ]);
    // Match 1: a gets 3 + 0.3 = 3.3
    // Match 2: a gets 1 + 0.6 = 1.6
    expect(scores.get("a")).toBeCloseTo(4.9);
    expect(scores.get("b")).toBe(0);
    expect(scores.get("c")).toBeCloseTo(1 + 2 * 0.3); // 1.6
  });

  it("returns an empty map for no matches", () => {
    expect(computeTeamScores([])).toEqual(new Map());
  });
});

describe("computeSelectionScore", () => {
  it("sums scores for the teams in the selection", () => {
    const teamScores = new Map([["a", 5], ["b", 3.9], ["c", 0]]);
    expect(computeSelectionScore(teamScores, ["a", "b"])).toBeCloseTo(8.9);
  });

  it("treats missing teams as 0", () => {
    const teamScores = new Map([["a", 4]]);
    expect(computeSelectionScore(teamScores, ["a", "z"])).toBeCloseTo(4);
  });

  it("returns 0 for an empty selection", () => {
    expect(computeSelectionScore(new Map(), [])).toBe(0);
  });
});
