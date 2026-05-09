import { Phase, MatchResult } from "@/app/generated/prisma/enums";

// ── Group definitions ────────────────────────────────────────────────────────
export const WC_GROUPS = [
  { letter: "A", teams: ["Mexico", "South Africa", "South Korea", "Czechia"] },
  { letter: "B", teams: ["Canada", "Switzerland", "Qatar", "Bosnia and Herzegovina"] },
  { letter: "C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
  { letter: "D", teams: ["United States", "Paraguay", "Australia", "Türkiye"] },
  { letter: "E", teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"] },
  { letter: "F", teams: ["Netherlands", "Japan", "Sweden", "Tunisia"] },
  { letter: "G", teams: ["Belgium", "Egypt", "Iran", "New Zealand"] },
  { letter: "H", teams: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"] },
  { letter: "I", teams: ["France", "Senegal", "Norway", "Iraq"] },
  { letter: "J", teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
  { letter: "K", teams: ["Portugal", "Congo DR", "Uzbekistan", "Colombia"] },
  { letter: "L", teams: ["England", "Croatia", "Ghana", "Panama"] },
];

// ── Knockout notes in FIFA match order ──────────────────────────────────────
// R32 = matches 73-88, R16 = 89-96, QF = 97-100, SF = 101-102
export const R32_NOTES = [
  "Runner-up Group A vs Runner-up Group B",             // 73
  "Winner Group E vs 3rd Place Group A/B/C/D/F",       // 74
  "Winner Group F vs Runner-up Group C",                // 75
  "Winner Group C vs Runner-up Group F",                // 76
  "Winner Group I vs 3rd Place Group C/D/F/G/H",       // 77
  "Runner-up Group E vs Runner-up Group I",             // 78
  "Winner Group A vs 3rd Place Group C/E/F/H/I",       // 79
  "Winner Group L vs 3rd Place Group E/H/I/J/K",       // 80
  "Winner Group D vs 3rd Place Group B/E/F/I/J",       // 81
  "Winner Group G vs 3rd Place Group A/E/H/I/J",       // 82
  "Runner-up Group K vs Runner-up Group L",             // 83
  "Winner Group H vs Runner-up Group J",                // 84
  "Winner Group B vs 3rd Place Group E/F/G/I/J",       // 85
  "Winner Group J vs Runner-up Group H",                // 86
  "Winner Group K vs 3rd Place Group D/E/I/J/L",       // 87
  "Runner-up Group D vs Runner-up Group G",             // 88
];

export const R16_NOTES = [
  "Winner Match 74 vs Winner Match 77",   // 89
  "Winner Match 73 vs Winner Match 75",   // 90
  "Winner Match 76 vs Winner Match 78",   // 91
  "Winner Match 79 vs Winner Match 80",   // 92
  "Winner Match 83 vs Winner Match 84",   // 93
  "Winner Match 81 vs Winner Match 82",   // 94
  "Winner Match 86 vs Winner Match 88",   // 95
  "Winner Match 85 vs Winner Match 87",   // 96
];

export const QF_NOTES = [
  "Winner Match 89 vs Winner Match 90",   // 97
  "Winner Match 93 vs Winner Match 94",   // 98
  "Winner Match 91 vs Winner Match 92",   // 99
  "Winner Match 95 vs Winner Match 96",   // 100
];

export const SF_NOTES = [
  "Winner Match 97 vs Winner Match 98",   // 101
  "Winner Match 99 vs Winner Match 100",  // 102
];

export const FINAL_NOTE = "Winner Match 101 vs Winner Match 102";
export const THIRD_NOTE = "Loser Match 101 vs Loser Match 102";

// ── Match-number → note index ────────────────────────────────────────────────
export const NOTE_BY_NUM: Record<number, string> = {};
R32_NOTES.forEach((n, i) => { NOTE_BY_NUM[73 + i] = n; });
R16_NOTES.forEach((n, i) => { NOTE_BY_NUM[89 + i] = n; });
QF_NOTES.forEach((n, i)  => { NOTE_BY_NUM[97 + i] = n; });
SF_NOTES.forEach((n, i)  => { NOTE_BY_NUM[101 + i] = n; });

// ── Types ────────────────────────────────────────────────────────────────────
export type MatchSnap = {
  winner: MatchResult;
  team1Id: string;
  team2Id: string;
  team1Goals: number;
  team2Goals: number;
  pkTeam1Goals: number | null;
  pkTeam2Goals: number | null;
};

export type Slot = { note: string; phase: Phase; spec1: string; spec2: string };

// ── Slot definitions ─────────────────────────────────────────────────────────
// Full slots: both teams can be resolved automatically.
// Partial slots: only team1 (the group winner) is auto-resolvable; team2 is a
// 3rd-place team determined by admin after all groups finish.
export const SLOTS: Slot[] = [];
export const PARTIAL_R32_SLOTS: Slot[] = []; // "Winner Group X vs 3rd Place …"

for (const note of R32_NOTES) {
  const [spec1, spec2] = note.split(" vs ");
  if (spec1.includes("3rd") || spec2.includes("3rd")) {
    PARTIAL_R32_SLOTS.push({ note, phase: Phase.R32, spec1, spec2 });
  } else {
    SLOTS.push({ note, phase: Phase.R32, spec1, spec2 });
  }
}
for (const note of R16_NOTES) {
  const [spec1, spec2] = note.split(" vs ");
  SLOTS.push({ note, phase: Phase.R16, spec1, spec2 });
}
for (const note of QF_NOTES) {
  const [spec1, spec2] = note.split(" vs ");
  SLOTS.push({ note, phase: Phase.QF, spec1, spec2 });
}
for (const note of SF_NOTES) {
  const [spec1, spec2] = note.split(" vs ");
  SLOTS.push({ note, phase: Phase.SF, spec1, spec2 });
}
{
  const [spec1, spec2] = FINAL_NOTE.split(" vs ");
  SLOTS.push({ note: FINAL_NOTE, phase: Phase.FINAL, spec1, spec2 });
}
{
  const [spec1, spec2] = THIRD_NOTE.split(" vs ");
  SLOTS.push({ note: THIRD_NOTE, phase: Phase.THIRD, spec1, spec2 });
}

// ── Group standings ──────────────────────────────────────────────────────────
export function rankGroup(
  teamIds: string[],
  matches: MatchSnap[]
): { teamId: string; pts: number; gd: number; gf: number }[] {
  const s = new Map(teamIds.map(id => [id, { teamId: id, pts: 0, gd: 0, gf: 0 }]));

  for (const m of matches) {
    if (m.winner === MatchResult.UPCOMING) continue;
    const a = s.get(m.team1Id);
    const b = s.get(m.team2Id);
    if (!a || !b) continue;
    a.gf += m.team1Goals; a.gd += m.team1Goals - m.team2Goals;
    b.gf += m.team2Goals; b.gd += m.team2Goals - m.team1Goals;
    if (m.winner === MatchResult.TEAM1)      a.pts += 3;
    else if (m.winner === MatchResult.TEAM2) b.pts += 3;
    else { a.pts++; b.pts++; }
  }

  return [...s.values()].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

// ── Advancer / eliminated ────────────────────────────────────────────────────
// For ET wins, winner = TEAM1/TEAM2. For PK games, winner = DRAW and pk goals decide.
export function advancer(m: MatchSnap): string | null {
  if (m.winner === MatchResult.TEAM1) return m.team1Id;
  if (m.winner === MatchResult.TEAM2) return m.team2Id;
  if (m.winner === MatchResult.DRAW) {
    if (m.pkTeam1Goals != null && m.pkTeam2Goals != null) {
      if (m.pkTeam1Goals > m.pkTeam2Goals) return m.team1Id;
      if (m.pkTeam2Goals > m.pkTeam1Goals) return m.team2Id;
    }
  }
  return null;
}

export function eliminated(m: MatchSnap): string | null {
  const w = advancer(m);
  if (!w) return null;
  return w === m.team1Id ? m.team2Id : m.team1Id;
}

// ── Resolve a slot spec to a team ID ────────────────────────────────────────
export function resolveSpec(
  spec: string,
  groupTeamIds: Map<string, string[]>,
  groupMatches: Map<string, MatchSnap[]>,
  matchByNote: Map<string, MatchSnap>
): string | null {
  // "Winner Group X" or "Runner-up Group X"
  const groupRef = spec.match(/^(Winner|Runner-up) Group ([A-L])$/);
  if (groupRef) {
    const pos    = groupRef[1] === "Winner" ? 0 : 1;
    const letter = groupRef[2];
    const ids    = groupTeamIds.get(letter) ?? [];
    const gm     = groupMatches.get(letter) ?? [];
    const played = gm.filter(m => m.winner !== MatchResult.UPCOMING).length;
    if (played < 6) return null;
    return rankGroup(ids, gm)[pos]?.teamId ?? null;
  }

  // "Winner Match N" or "Loser Match N"
  const matchRef = spec.match(/^(Winner|Loser) Match (\d+)$/);
  if (matchRef) {
    const note = NOTE_BY_NUM[parseInt(matchRef[2])];
    if (!note) return null;
    const m = matchByNote.get(note);
    if (!m || m.winner === MatchResult.UPCOMING) return null;
    return matchRef[1] === "Winner" ? advancer(m) : eliminated(m);
  }

  return null;
}
