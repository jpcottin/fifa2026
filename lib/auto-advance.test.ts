import { describe, it, expect } from "vitest";
import { MatchResult, Phase } from "@/app/generated/prisma/enums";
import {
  rankGroup,
  advancer,
  eliminated,
  resolveSpec,
  SLOTS,
  NOTE_BY_NUM,
  R32_NOTES,
  type MatchSnap,
} from "./auto-advance-core";

// ── Helpers ──────────────────────────────────────────────────────────────────
function snap(
  team1Id: string,
  team2Id: string,
  winner: MatchResult,
  team1Goals = 0,
  team2Goals = 0,
  pkTeam1Goals: number | null = null,
  pkTeam2Goals: number | null = null
): MatchSnap {
  return { winner, team1Id, team2Id, team1Goals, team2Goals, pkTeam1Goals, pkTeam2Goals };
}

// Complete group: a=1st(7pts,gd+3), d=2nd(5pts,gd+2), b=3rd(4pts,gd+1), c=4th(0pts)
const GROUP_MATCHES: MatchSnap[] = [
  snap("a", "b", MatchResult.TEAM1, 2, 0),
  snap("a", "c", MatchResult.TEAM1, 1, 0),
  snap("a", "d", MatchResult.DRAW,  1, 1),
  snap("b", "c", MatchResult.TEAM1, 3, 0),
  snap("b", "d", MatchResult.DRAW,  0, 0),
  snap("c", "d", MatchResult.TEAM2, 0, 2),
];
const GROUP_IDS = ["a", "b", "c", "d"];

const EMPTY_GROUP_IDS   = new Map<string, string[]>();
const EMPTY_GROUP_MATCHES = new Map<string, MatchSnap[]>();
const EMPTY_MATCH_BY_NOTE = new Map<string, MatchSnap>();

// ── rankGroup ────────────────────────────────────────────────────────────────
describe("rankGroup", () => {
  it("returns teams sorted by points descending", () => {
    const ranked = rankGroup(GROUP_IDS, GROUP_MATCHES);
    expect(ranked.map(r => r.teamId)).toEqual(["a", "d", "b", "c"]);
  });

  it("winner has correct point and GD totals", () => {
    const [first] = rankGroup(GROUP_IDS, GROUP_MATCHES);
    expect(first.pts).toBe(7);
    expect(first.gd).toBe(3);
    expect(first.gf).toBe(4);
  });

  it("ignores UPCOMING matches", () => {
    const partial = [...GROUP_MATCHES.slice(0, 3), snap("b", "c", MatchResult.UPCOMING)];
    const ranked = rankGroup(GROUP_IDS, partial);
    // b and c have 0 played matches — standings still computed without errors
    expect(ranked).toHaveLength(4);
  });

  it("tiebreaker: same pts uses GD then GF", () => {
    // x beats z 3-0 (3pts, gd+3), y beats z 1-0 (3pts, gd+1), x draws y (1pt each)
    const matches: MatchSnap[] = [
      snap("x", "z", MatchResult.TEAM1, 3, 0),
      snap("y", "z", MatchResult.TEAM1, 1, 0),
      snap("x", "y", MatchResult.DRAW,  0, 0),
    ];
    const ranked = rankGroup(["x", "y", "z"], matches);
    expect(ranked[0].teamId).toBe("x"); // 4pts, gd+3
    expect(ranked[1].teamId).toBe("y"); // 4pts, gd+1
    expect(ranked[2].teamId).toBe("z"); // 0pts
  });
});

// ── advancer ─────────────────────────────────────────────────────────────────
describe("advancer", () => {
  it("returns team1 on TEAM1 win", () => {
    expect(advancer(snap("t1", "t2", MatchResult.TEAM1))).toBe("t1");
  });

  it("returns team2 on TEAM2 win", () => {
    expect(advancer(snap("t1", "t2", MatchResult.TEAM2))).toBe("t2");
  });

  it("returns null on UPCOMING", () => {
    expect(advancer(snap("t1", "t2", MatchResult.UPCOMING))).toBeNull();
  });

  it("returns null on DRAW without PK goals", () => {
    expect(advancer(snap("t1", "t2", MatchResult.DRAW, 1, 1))).toBeNull();
  });

  it("returns team1 when team1 wins PK shootout", () => {
    expect(advancer(snap("t1", "t2", MatchResult.DRAW, 1, 1, 5, 3))).toBe("t1");
  });

  it("returns team2 when team2 wins PK shootout", () => {
    expect(advancer(snap("t1", "t2", MatchResult.DRAW, 1, 1, 3, 4))).toBe("t2");
  });
});

// ── eliminated ───────────────────────────────────────────────────────────────
describe("eliminated", () => {
  it("returns team2 on TEAM1 win", () => {
    expect(eliminated(snap("t1", "t2", MatchResult.TEAM1))).toBe("t2");
  });

  it("returns team1 on TEAM2 win", () => {
    expect(eliminated(snap("t1", "t2", MatchResult.TEAM2))).toBe("t1");
  });

  it("returns team1 when team2 wins PK shootout", () => {
    expect(eliminated(snap("t1", "t2", MatchResult.DRAW, 1, 1, 3, 5))).toBe("t1");
  });

  it("returns null on UPCOMING", () => {
    expect(eliminated(snap("t1", "t2", MatchResult.UPCOMING))).toBeNull();
  });
});

// ── resolveSpec — group refs ─────────────────────────────────────────────────
describe("resolveSpec — group refs", () => {
  const groupTeamIds   = new Map([["A", GROUP_IDS]]);
  const groupMatches   = new Map([["A", GROUP_MATCHES]]);

  it("resolves Winner Group A to the group winner", () => {
    expect(resolveSpec("Winner Group A", groupTeamIds, groupMatches, EMPTY_MATCH_BY_NOTE)).toBe("a");
  });

  it("resolves Runner-up Group A to the 2nd-place team", () => {
    expect(resolveSpec("Runner-up Group A", groupTeamIds, groupMatches, EMPTY_MATCH_BY_NOTE)).toBe("d");
  });

  it("returns null when group has fewer than 6 played matches", () => {
    const incomplete = new Map([["A", GROUP_MATCHES.slice(0, 5)]]);
    expect(resolveSpec("Winner Group A", groupTeamIds, incomplete, EMPTY_MATCH_BY_NOTE)).toBeNull();
  });

  it("returns null for an unknown group letter", () => {
    expect(resolveSpec("Winner Group Z", groupTeamIds, groupMatches, EMPTY_MATCH_BY_NOTE)).toBeNull();
  });

  it("returns null for 3rd-place spec (not handled)", () => {
    expect(resolveSpec("3rd Place Group A/B/C/D/F", groupTeamIds, groupMatches, EMPTY_MATCH_BY_NOTE)).toBeNull();
  });
});

// ── resolveSpec — match refs ─────────────────────────────────────────────────
describe("resolveSpec — match refs", () => {
  // Match 73 → NOTE_BY_NUM[73] = R32_NOTES[0] = "Runner-up Group A vs Runner-up Group B"
  const r32note73 = NOTE_BY_NUM[73];

  it("resolves Winner Match 73 to the winner of that R32 match", () => {
    const matchByNote = new Map([[r32note73, snap("ru_a", "ru_b", MatchResult.TEAM1, 2, 1)]]);
    expect(resolveSpec("Winner Match 73", EMPTY_GROUP_IDS, EMPTY_GROUP_MATCHES, matchByNote)).toBe("ru_a");
  });

  it("resolves Winner Match 73 to team2 when TEAM2 wins", () => {
    const matchByNote = new Map([[r32note73, snap("ru_a", "ru_b", MatchResult.TEAM2, 0, 1)]]);
    expect(resolveSpec("Winner Match 73", EMPTY_GROUP_IDS, EMPTY_GROUP_MATCHES, matchByNote)).toBe("ru_b");
  });

  it("returns null when the referenced match is still UPCOMING", () => {
    const matchByNote = new Map([[r32note73, snap("ru_a", "ru_b", MatchResult.UPCOMING)]]);
    expect(resolveSpec("Winner Match 73", EMPTY_GROUP_IDS, EMPTY_GROUP_MATCHES, matchByNote)).toBeNull();
  });

  it("returns null for an unrecognised match number", () => {
    expect(resolveSpec("Winner Match 999", EMPTY_GROUP_IDS, EMPTY_GROUP_MATCHES, EMPTY_MATCH_BY_NOTE)).toBeNull();
  });

  it("resolves Loser Match 101 (SF loser → 3rd place game)", () => {
    // Match 101 → SF_NOTES[0] = "Winner Match 97 vs Winner Match 98"
    const sfNote = NOTE_BY_NUM[101];
    const matchByNote = new Map([[sfNote, snap("sf1", "sf2", MatchResult.TEAM2, 1, 2)]]);
    // TEAM2 wins → sf1 is eliminated
    expect(resolveSpec("Loser Match 101", EMPTY_GROUP_IDS, EMPTY_GROUP_MATCHES, matchByNote)).toBe("sf1");
  });

  it("resolves Winner Match via PK draw", () => {
    const matchByNote = new Map([[r32note73, snap("ru_a", "ru_b", MatchResult.DRAW, 1, 1, 5, 3)]]);
    expect(resolveSpec("Winner Match 73", EMPTY_GROUP_IDS, EMPTY_GROUP_MATCHES, matchByNote)).toBe("ru_a");
  });
});

// ── SLOTS constant ───────────────────────────────────────────────────────────
describe("SLOTS", () => {
  it("has 8 R32 slots (no 3rd-place ones)", () => {
    expect(SLOTS.filter(s => s.phase === Phase.R32)).toHaveLength(8);
  });

  it("has 8 R16 slots", () => {
    expect(SLOTS.filter(s => s.phase === Phase.R16)).toHaveLength(8);
  });

  it("has 4 QF slots", () => {
    expect(SLOTS.filter(s => s.phase === Phase.QF)).toHaveLength(4);
  });

  it("has 2 SF slots", () => {
    expect(SLOTS.filter(s => s.phase === Phase.SF)).toHaveLength(2);
  });

  it("has 1 Final and 1 Third slot", () => {
    expect(SLOTS.filter(s => s.phase === Phase.FINAL)).toHaveLength(1);
    expect(SLOTS.filter(s => s.phase === Phase.THIRD)).toHaveLength(1);
  });

  it("no slot contains a 3rd-place spec", () => {
    const has3rd = SLOTS.some(s => s.spec1.includes("3rd") || s.spec2.includes("3rd"));
    expect(has3rd).toBe(false);
  });
});

// ── NOTE_BY_NUM sanity ────────────────────────────────────────────────────────
describe("NOTE_BY_NUM", () => {
  it("match 73 maps to Runner-up Group A vs Runner-up Group B", () => {
    expect(NOTE_BY_NUM[73]).toBe("Runner-up Group A vs Runner-up Group B");
  });
  it("match 74 maps to Winner Group E vs 3rd Place Group A/B/C/D/F", () => {
    expect(NOTE_BY_NUM[74]).toBe("Winner Group E vs 3rd Place Group A/B/C/D/F");
  });
  it("match 83 maps to Runner-up Group K vs Runner-up Group L", () => {
    expect(NOTE_BY_NUM[83]).toBe("Runner-up Group K vs Runner-up Group L");
  });
  it("match 91 maps to Winner Match 76 vs Winner Match 78", () => {
    expect(NOTE_BY_NUM[91]).toBe("Winner Match 76 vs Winner Match 78");
  });
  it("match 93 maps to Winner Match 83 vs Winner Match 84", () => {
    expect(NOTE_BY_NUM[93]).toBe("Winner Match 83 vs Winner Match 84");
  });

  it("covers all expected match numbers (73-102)", () => {
    const nums = Object.keys(NOTE_BY_NUM).map(Number);
    expect(Math.min(...nums)).toBe(73);
    expect(Math.max(...nums)).toBe(102);
    expect(nums).toHaveLength(30); // 16 (R32) + 8 (R16) + 4 (QF) + 2 (SF) = 30
  });
});
