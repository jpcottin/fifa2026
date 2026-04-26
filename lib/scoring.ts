import { prisma } from "./db";
import { MatchResult, Phase } from "@/app/generated/prisma/enums";

export type MatchData = {
  team1Id: string;
  team2Id: string;
  team1Goals: number;
  team2Goals: number;
  winner: MatchResult;
  phase: Phase;
};

export function goalMultiplier(phase: Phase): number {
  return phase === "GROUP" ? 0.3 : 0.5;
}

export function computeTeamScores(matches: MatchData[]): Map<string, number> {
  const scores = new Map<string, number>();
  const add = (id: string, pts: number) =>
    scores.set(id, (scores.get(id) ?? 0) + pts);

  for (const m of matches) {
    const mult = goalMultiplier(m.phase);
    if (m.winner === MatchResult.TEAM1) add(m.team1Id, 3);
    else if (m.winner === MatchResult.TEAM2) add(m.team2Id, 3);
    else if (m.winner === MatchResult.DRAW) { add(m.team1Id, 1); add(m.team2Id, 1); }
    add(m.team1Id, m.team1Goals * mult);
    add(m.team2Id, m.team2Goals * mult);
  }

  return scores;
}

export function computeSelectionScore(
  teamScoreMap: Map<string, number>,
  teamIds: string[]
): number {
  return teamIds.reduce((sum, id) => sum + (teamScoreMap.get(id) ?? 0), 0);
}

export async function recalculateAllScores() {
  const [matches, teams, selections] = await Promise.all([
    prisma.match.findMany({ where: { winner: { not: MatchResult.UPCOMING } } }),
    prisma.team.findMany(),
    prisma.selection.findMany(),
  ]);

  // Start every team at 0, then overlay computed scores
  const teamScoreMap = new Map<string, number>(teams.map((t) => [t.id, 0]));
  for (const [id, score] of computeTeamScores(matches)) {
    teamScoreMap.set(id, score);
  }

  await prisma.$transaction([
    ...Array.from(teamScoreMap.entries()).map(([id, score]) =>
      prisma.team.update({ where: { id }, data: { score } })
    ),
    ...selections.map((sel) =>
      prisma.selection.update({
        where: { id: sel.id },
        data: { score: computeSelectionScore(teamScoreMap, sel.teamIds) },
      })
    ),
  ]);
}
