import { prisma } from "./db";
import { Phase, MatchResult } from "@/app/generated/prisma/enums";
import { WC_GROUPS, SLOTS, PARTIAL_R32_SLOTS, resolveSpec, type MatchSnap } from "./auto-advance-core";

export async function autoAdvanceKnockout(): Promise<void> {
  const [allMatches, allTeams] = await Promise.all([
    prisma.match.findMany(),
    prisma.team.findMany(),
  ]);

  const teamByName = new Map(allTeams.map(t => [t.name, t.id]));

  const groupTeamIds = new Map<string, string[]>();
  const groupMatches = new Map<string, MatchSnap[]>();

  for (const g of WC_GROUPS) {
    const ids   = g.teams.flatMap(name => { const id = teamByName.get(name); return id ? [id] : []; });
    const idSet = new Set(ids);
    groupTeamIds.set(g.letter, ids);
    groupMatches.set(
      g.letter,
      allMatches
        .filter(m => m.phase === Phase.GROUP && idSet.has(m.team1Id) && idSet.has(m.team2Id))
        .map(m => ({
          winner: m.winner, team1Id: m.team1Id, team2Id: m.team2Id,
          team1Goals: m.team1Goals, team2Goals: m.team2Goals,
          pkTeam1Goals: m.pkTeam1Goals, pkTeam2Goals: m.pkTeam2Goals,
        }))
    );
  }

  const matchByNote = new Map<string, MatchSnap>();
  for (const m of allMatches) {
    if (m.note && m.phase !== Phase.GROUP) {
      matchByNote.set(m.note, {
        winner: m.winner, team1Id: m.team1Id, team2Id: m.team2Id,
        team1Goals: m.team1Goals, team2Goals: m.team2Goals,
        pkTeam1Goals: m.pkTeam1Goals, pkTeam2Goals: m.pkTeam2Goals,
      });
    }
  }

  for (const slot of SLOTS) {
    const team1Id = resolveSpec(slot.spec1, groupTeamIds, groupMatches, matchByNote);
    const team2Id = resolveSpec(slot.spec2, groupTeamIds, groupMatches, matchByNote);
    if (!team1Id || !team2Id) continue;

    const existing = allMatches.find(m => m.note === slot.note && m.phase === slot.phase);

    if (existing) {
      if (existing.winner !== MatchResult.UPCOMING) continue;
      if (existing.teamsLocked) continue;
      if (existing.team1Id === team1Id && existing.team2Id === team2Id) continue;
      await prisma.match.update({ where: { id: existing.id }, data: { team1Id, team2Id } });
    } else {
      await prisma.match.create({
        data: {
          team1Id, team2Id, phase: slot.phase,
          winner: MatchResult.UPCOMING, team1Goals: 0, team2Goals: 0,
          note: slot.note,
        },
      });
    }
  }

  // Partial fill: update team1 of "Winner Group X vs 3rd Place …" R32 matches
  // as soon as the group winner is known. team2 stays TBD until admin sets it.
  for (const slot of PARTIAL_R32_SLOTS) {
    const team1Id = resolveSpec(slot.spec1, groupTeamIds, groupMatches, matchByNote);
    if (!team1Id) continue;

    const existing = allMatches.find(m => m.note === slot.note && m.phase === Phase.R32);
    if (!existing || existing.teamsLocked || existing.winner !== MatchResult.UPCOMING) continue;
    if (existing.team1Id === team1Id) continue;
    await prisma.match.update({ where: { id: existing.id }, data: { team1Id } });
  }
}
