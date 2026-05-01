"use client";

import React from "react";

type TeamInfo = { name: string; flagEmoji: string };
export type BracketMatch = {
  id: string;
  team1: TeamInfo;
  team2: TeamInfo;
  team1Goals: number;
  team2Goals: number;
  winner: string;
  date: string | null;
  note: string | null;
};

// ── Layout constants ──────────────────────────────────────────────────────────
const SLOT_H   = 64;   // height allocated per R32 match slot (px)
const CARD_H   = 46;   // match card height (px)
const CARD_W   = 182;  // match card width (px)
const CONN_W   = 28;   // connector strip width between rounds (px)
const HEADER_H = 52;   // round-label area height (px)
const PAD      = 12;   // left/right outer padding (px)
const CHAMP_W  = 108;  // champion card width (px)
const CHAMP_H  = 68;   // champion card height (px)

const TOTAL_H = HEADER_H + 16 * SLOT_H;
const TOTAL_W = PAD + 5 * (CARD_W + CONN_W) + CHAMP_W + PAD;

const LINE_COLOR = "#d1d5db"; // gray-300

// ── Round metadata ────────────────────────────────────────────────────────────
const ROUNDS = ["R32", "R16", "QF", "SF", "FINAL"] as const;
type RoundKey = (typeof ROUNDS)[number];

const ROUND_LABELS: Record<RoundKey, string> = {
  R32: "Round of 32", R16: "Round of 16", QF: "Quarter-finals",
  SF: "Semi-finals",  FINAL: "Final",
};
const ROUND_DATES: Record<RoundKey, string> = {
  R32: "Jun 28 – Jul 3", R16: "Jul 4 – Jul 7", QF: "Jul 9 – Jul 11",
  SF: "Jul 14–15",       FINAL: "Jul 19",
};

// ── Bracket seeding (note strings identify each match in the DB) ──────────────
const THIRD_PLACE_NOTE = "Loser Match 101 vs Loser Match 102";

const BRACKET_NOTES: Record<RoundKey, string[]> = {
  R32: [
    "Winner Group E vs 3rd Place Group A/B/C/D/F",
    "Winner Group I vs 3rd Place Group C/D/F/G/H",
    "Runner-up Group A vs Runner-up Group B",
    "Winner Group F vs Runner-up Group C",
    "Runner-up Group K vs Runner-up Group L",
    "Winner Group H vs Runner-up Group J",
    "Winner Group D vs 3rd Place Group B/E/F/I/J",
    "Winner Group G vs 3rd Place Group A/E/H/I/J",
    "Winner Group C vs Runner-up Group F",
    "Runner-up Group E vs Runner-up Group I",
    "Winner Group A vs 3rd Place Group C/E/F/H/I",
    "Winner Group L vs 3rd Place Group E/H/I/J/K",
    "Winner Group J vs Runner-up Group H",
    "Runner-up Group D vs Runner-up Group G",
    "Winner Group B vs 3rd Place Group E/F/G/I/J",
    "Winner Group K vs 3rd Place Group D/E/I/J/L",
  ],
  R16: [
    "Winner Match 74 vs Winner Match 77",
    "Winner Match 73 vs Winner Match 75",
    "Winner Match 83 vs Winner Match 84",
    "Winner Match 81 vs Winner Match 82",
    "Winner Match 76 vs Winner Match 78",
    "Winner Match 79 vs Winner Match 80",
    "Winner Match 86 vs Winner Match 88",
    "Winner Match 85 vs Winner Match 87",
  ],
  QF: [
    "Winner Match 89 vs Winner Match 90",
    "Winner Match 93 vs Winner Match 94",
    "Winner Match 91 vs Winner Match 92",
    "Winner Match 95 vs Winner Match 96",
  ],
  SF: [
    "Winner Match 97 vs Winner Match 98",
    "Winner Match 99 vs Winner Match 100",
  ],
  FINAL: ["Winner Match 101 vs Winner Match 102"],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function shortNote(note: string): string {
  return note
    .replace(/Winner Group ([A-L])/g,   (_, g) => `${g}1`)
    .replace(/Runner-up Group ([A-L])/g, (_, g) => `${g}2`)
    .replace(/3rd Place Group [A-L/]+/g, "3rd")
    .replace(/Winner Match (\d+)/g,      (_, n) => `W${n}`)
    .replace(/Loser Match (\d+)/g,       (_, n) => `L${n}`);
}

function fmtDate(d: string | null): string {
  if (!d) return "TBD";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isTbd(name: string) { return name.startsWith("TBD"); }

// ── Match card ────────────────────────────────────────────────────────────────
function BracketCard({ match }: { match: BracketMatch | null }) {
  if (!match) {
    return (
      <div
        style={{ width: CARD_W, height: CARD_H, borderColor: LINE_COLOR }}
        className="rounded border bg-gray-50 flex items-center justify-center"
      >
        <span className="text-[10px] text-gray-300">–</span>
      </div>
    );
  }

  const tbd = isTbd(match.team1.name) || isTbd(match.team2.name);

  if (tbd) {
    return (
      <div
        style={{ width: CARD_W, height: CARD_H, borderColor: LINE_COLOR }}
        className="rounded border bg-gray-50 px-2 flex flex-col justify-center"
      >
        <span className="text-[11px] italic text-gray-500 leading-tight">
          {match.note ? shortNote(match.note) : "TBD vs TBD"}
        </span>
        <span className="text-[10px] text-gray-400 mt-0.5">{fmtDate(match.date)}</span>
      </div>
    );
  }

  const w1 = match.winner === "TEAM1";
  const w2 = match.winner === "TEAM2";
  const upcoming = match.winner === "UPCOMING";

  return (
    <div
      style={{ width: CARD_W, height: CARD_H, borderColor: LINE_COLOR }}
      className="rounded border bg-white flex flex-col justify-center px-2 gap-0.5"
    >
      {/* Team 1 */}
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-xs shrink-0">{match.team1.flagEmoji}</span>
        <span className={`text-[11px] flex-1 truncate ${w1 ? "text-green-700 font-semibold" : "text-gray-700"}`}>
          {match.team1.name}
        </span>
        {!upcoming && (
          <span className={`text-[11px] font-mono font-bold shrink-0 ${w1 ? "text-green-700" : "text-gray-500"}`}>
            {match.team1Goals}
          </span>
        )}
      </div>
      {/* Date (upcoming only) */}
      {upcoming && (
        <div className="text-center text-[10px] text-gray-400 leading-none">{fmtDate(match.date)}</div>
      )}
      {/* Team 2 */}
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-xs shrink-0">{match.team2.flagEmoji}</span>
        <span className={`text-[11px] flex-1 truncate ${w2 ? "text-green-700 font-semibold" : "text-gray-700"}`}>
          {match.team2.name}
        </span>
        {!upcoming && (
          <span className={`text-[11px] font-mono font-bold shrink-0 ${w2 ? "text-green-700" : "text-gray-500"}`}>
            {match.team2Goals}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main bracket component ────────────────────────────────────────────────────
export function KnockoutBracket({ matches }: { matches: BracketMatch[] }) {
  const byNote = new Map(matches.filter((m) => m.note).map((m) => [m.note!, m]));

  // ── Connector lines ─────────────────────────────────────────────────────────
  const lines: React.CSSProperties[] = [];

  for (let r = 0; r < ROUNDS.length - 1; r++) {
    const slotsPerMatch = Math.pow(2, r);
    const roundRight   = PAD + r * (CARD_W + CONN_W) + CARD_W;
    const halfConn     = CONN_W / 2;
    const numNext      = BRACKET_NOTES[ROUNDS[r + 1]].length;

    for (let i = 0; i < numNext; i++) {
      const cy1  = HEADER_H + (2 * i + 0.5) * slotsPerMatch * SLOT_H;
      const cy2  = HEADER_H + (2 * i + 1.5) * slotsPerMatch * SLOT_H;
      const midY = (cy1 + cy2) / 2;

      lines.push(
        // H-line from top match to vert bar
        { position: "absolute", top: cy1,  left: roundRight,             width: halfConn, height: 1, backgroundColor: LINE_COLOR },
        // H-line from bottom match to vert bar
        { position: "absolute", top: cy2,  left: roundRight,             width: halfConn, height: 1, backgroundColor: LINE_COLOR },
        // Vertical bar
        { position: "absolute", top: cy1,  left: roundRight + halfConn,  width: 1, height: cy2 - cy1, backgroundColor: LINE_COLOR },
        // H-line from vert bar to next-round match
        { position: "absolute", top: midY, left: roundRight + halfConn,  width: halfConn, height: 1, backgroundColor: LINE_COLOR },
      );
    }
  }

  // H-line from Final to champion card
  const finalRight = PAD + 4 * (CARD_W + CONN_W) + CARD_W;
  const centerY    = HEADER_H + 8 * SLOT_H;
  lines.push({
    position: "absolute", top: centerY, left: finalRight,
    width: CONN_W, height: 1, backgroundColor: LINE_COLOR,
  });

  // ── Third Place Play-off (below Final) ──────────────────────────────────────
  const finalColLeft    = PAD + 4 * (CARD_W + CONN_W);
  const finalCardBottom = HEADER_H + (16 * SLOT_H + CARD_H) / 2;
  const thirdLabelTop   = finalCardBottom + 16;
  const thirdCardTop    = thirdLabelTop + 17;
  const thirdMatch      = byNote.get(THIRD_PLACE_NOTE) ?? null;

  // ── Champion ────────────────────────────────────────────────────────────────
  const finalMatch = byNote.get(BRACKET_NOTES.FINAL[0]) ?? null;
  const champion =
    finalMatch?.winner === "TEAM1" ? finalMatch.team1 :
    finalMatch?.winner === "TEAM2" ? finalMatch.team2 : null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div style={{ position: "relative", width: TOTAL_W, height: TOTAL_H }}>

        {/* Round headers */}
        {ROUNDS.map((round, r) => (
          <div
            key={round}
            style={{ position: "absolute", top: 0, left: PAD + r * (CARD_W + CONN_W), width: CARD_W }}
            className="text-center"
          >
            <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
              {ROUND_LABELS[round]}
            </div>
            <div className="text-[10px] text-gray-400">{ROUND_DATES[round]}</div>
          </div>
        ))}

        {/* Connector lines */}
        {lines.map((style, i) => <div key={i} style={style} />)}

        {/* Match cards */}
        {ROUNDS.flatMap((round, r) =>
          BRACKET_NOTES[round].map((note, i) => {
            const slotsPerMatch = Math.pow(2, r);
            const top  = HEADER_H + i * slotsPerMatch * SLOT_H + (slotsPerMatch * SLOT_H - CARD_H) / 2;
            const left = PAD + r * (CARD_W + CONN_W);
            return (
              <div key={`${round}-${i}`} style={{ position: "absolute", top, left }}>
                <BracketCard match={byNote.get(note) ?? null} />
              </div>
            );
          })
        )}

        {/* Champion card */}
        <div
          style={{
            position: "absolute",
            top: centerY - CHAMP_H / 2,
            left: finalRight + CONN_W,
            width: CHAMP_W,
            height: CHAMP_H,
          }}
          className="rounded-lg border border-green-300 bg-green-50 flex flex-col items-center justify-center gap-0.5 text-center"
        >
          <span className="text-2xl">🏆</span>
          {champion ? (
            <>
              <span className="text-sm">{champion.flagEmoji}</span>
              <span className="text-[11px] font-semibold text-green-700 leading-tight px-1">
                {champion.name}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wide leading-tight">
                World Cup
              </span>
              <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wide leading-tight">
                Champion
              </span>
            </>
          )}
        </div>

        {/* Third Place Play-off */}
        <div
          style={{ position: "absolute", top: thirdLabelTop, left: finalColLeft, width: CARD_W }}
          className="text-center"
        >
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            3rd Place Play-off · Jul 18
          </span>
        </div>
        <div style={{ position: "absolute", top: thirdCardTop, left: finalColLeft }}>
          <BracketCard match={thirdMatch} />
        </div>

      </div>
    </div>
  );
}
