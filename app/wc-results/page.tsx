export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { WC_GROUPS } from "@/lib/wc-groups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KnockoutBracket } from "@/components/knockout-bracket";

type TeamInfo = { id: string; name: string; flagEmoji: string };
type MatchRow = {
  id: string;
  team1: TeamInfo; team2: TeamInfo;
  team1Goals: number; team2Goals: number;
  winner: string;
  date: Date | null;
};
type Standing = {
  team: TeamInfo;
  p: number; w: number; d: number; l: number;
  gf: number; ga: number; gd: number; pts: number;
};

function buildGroupData(
  groupTeamNames: string[],
  teamByName: Map<string, TeamInfo>,
  allMatches: MatchRow[],
) {
  const teamInfos = groupTeamNames.map((n) => teamByName.get(n)).filter(Boolean) as TeamInfo[];
  const ids = new Set(teamInfos.map((t) => t.id));

  const groupMatches = allMatches.filter(
    (m) => ids.has(m.team1.id) && ids.has(m.team2.id),
  );

  const standings = new Map<string, Standing>(
    teamInfos.map((t) => [t.id, { team: t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }]),
  );

  for (const m of groupMatches) {
    if (m.winner === "UPCOMING") continue;
    const s1 = standings.get(m.team1.id)!;
    const s2 = standings.get(m.team2.id)!;
    s1.p++; s2.p++;
    s1.gf += m.team1Goals; s1.ga += m.team2Goals;
    s2.gf += m.team2Goals; s2.ga += m.team1Goals;
    if (m.winner === "TEAM1")      { s1.w++; s1.pts += 3; s2.l++; }
    else if (m.winner === "TEAM2") { s2.w++; s2.pts += 3; s1.l++; }
    else                           { s1.d++; s1.pts++;    s2.d++; s2.pts++; }
  }

  const sorted = [...standings.values()]
    .map((s) => ({ ...s, gd: s.gf - s.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name));

  return { groupMatches, sorted };
}

export default async function WcResultsPage() {
  const [teams, matches] = await Promise.all([
    prisma.team.findMany({ where: { set: { gt: 0 } } }),
    prisma.match.findMany({
      include: { team1: true, team2: true },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const teamByName = new Map<string, TeamInfo>(
    teams.map((t) => [t.name, { id: t.id, name: t.name, flagEmoji: t.flagEmoji }]),
  );

  const allMatches: MatchRow[] = matches
    .filter((m) => m.phase === "GROUP")
    .map((m) => ({
      id: m.id,
      team1: { id: m.team1.id, name: m.team1.name, flagEmoji: m.team1.flagEmoji },
      team2: { id: m.team2.id, name: m.team2.name, flagEmoji: m.team2.flagEmoji },
      team1Goals: m.team1Goals,
      team2Goals: m.team2Goals,
      winner: m.winner,
      date: m.date,
    }));

  const bracketMatches = matches
    .filter((m) => m.phase !== "GROUP")
    .map((m) => ({
      id: m.id,
      team1: { name: m.team1.name, flagEmoji: m.team1.flagEmoji },
      team2: { name: m.team2.name, flagEmoji: m.team2.flagEmoji },
      team1Goals: m.team1Goals,
      team2Goals: m.team2Goals,
      winner: m.winner as string,
      date: m.date?.toISOString() ?? null,
      note: m.note ?? null,
    }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-green-800">WC Results</h1>

      <div className="space-y-6">
        {WC_GROUPS.map(({ letter, teams: groupTeamNames }) => {
          const { groupMatches, sorted } = buildGroupData(groupTeamNames, teamByName, allMatches);

          return (
            <Card key={letter}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Group {letter}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">

                {/* Standings table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b">
                      <th className="text-left py-1 font-medium">Team</th>
                      <th className="text-center w-7 font-medium">P</th>
                      <th className="text-center w-7 font-medium">W</th>
                      <th className="text-center w-7 font-medium">D</th>
                      <th className="text-center w-7 font-medium">L</th>
                      <th className="text-center w-9 font-medium">GD</th>
                      <th className="text-center w-9 font-medium">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s, idx) => (
                      <tr
                        key={s.team.id}
                        className={`border-b last:border-0 ${
                          idx < 2 ? "bg-green-50" : idx === 2 ? "bg-yellow-50" : ""
                        }`}
                      >
                        <td className="py-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="shrink-0">{s.team.flagEmoji}</span>
                            <span className="truncate">{s.team.name}</span>
                          </div>
                        </td>
                        <td className="text-center text-gray-500 w-7">{s.p}</td>
                        <td className="text-center text-gray-500 w-7">{s.w}</td>
                        <td className="text-center text-gray-500 w-7">{s.d}</td>
                        <td className="text-center text-gray-500 w-7">{s.l}</td>
                        <td className="text-center text-gray-500 w-9">
                          {s.gd > 0 ? `+${s.gd}` : s.gd}
                        </td>
                        <td className="text-center font-semibold w-9">{s.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Legend */}
                <div className="flex gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300" />
                    Advances
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-100 border border-yellow-300" />
                    May advance
                  </span>
                </div>

                {/* Matches */}
                <div className="space-y-2 pt-1">
                  {groupMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border text-sm"
                    >
                      {/* Team 1 */}
                      <div className="flex-1 flex items-center gap-2 justify-end">
                        <span
                          className={`font-medium ${
                            match.winner === "TEAM1" ? "text-green-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {match.team1.name}
                        </span>
                        <span className="text-xl">{match.team1.flagEmoji}</span>
                      </div>

                      {/* Score or date */}
                      <div className="text-center w-20 shrink-0">
                        {match.winner === "UPCOMING" ? (
                          <span className="text-xs text-gray-400">
                            {match.date
                              ? new Date(match.date).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric",
                                })
                              : "TBD"}
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-base">
                            {match.team1Goals} – {match.team2Goals}
                          </span>
                        )}
                      </div>

                      {/* Team 2 */}
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xl">{match.team2.flagEmoji}</span>
                        <span
                          className={`font-medium ${
                            match.winner === "TEAM2" ? "text-green-700 font-semibold" : "text-gray-700"
                          }`}
                        >
                          {match.team2.name}
                        </span>
                      </div>

                      {/* Result badge */}
                      <div className="shrink-0 w-16 text-right">
                        {match.winner === "DRAW" && (
                          <Badge variant="secondary" className="text-xs">Draw</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Knockout bracket */}
      {bracketMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-green-800 mb-3">Knockout Stage</h2>
          <KnockoutBracket matches={bracketMatches} />
        </div>
      )}

      {/* Ranking rules */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-green-800">How Teams are Ranked</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700">
          <p>
            With 12 groups of four, <strong>32 teams advance</strong> to the knockout stage: the top two
            from each group plus the <strong>eight best third-place finishers</strong>.
          </p>
          <p>Teams are ranked within their group using the following criteria in order:</p>
          <ol className="list-decimal list-outside ml-5 space-y-3">
            <li>
              <strong>Points</strong>
              <ul className="list-disc list-outside ml-5 mt-1 text-gray-500 space-y-0.5">
                <li>Win: 3 pts · Draw: 1 pt · Loss: 0 pts</li>
              </ul>
            </li>
            <li>
              <strong>Head-to-Head</strong>{" "}
              <span className="text-gray-500">(FIFA 2026 priority — similar to UEFA Euro format)</span>
              <ul className="list-disc list-outside ml-5 mt-1 text-gray-500 space-y-0.5">
                <li>Points earned in matches between the tied teams</li>
                <li>Goal difference in those matches</li>
                <li>Goals scored in those matches</li>
              </ul>
            </li>
            <li>
              <strong>Overall Group Performance</strong>{" "}
              <span className="text-gray-500">(if H2H doesn&apos;t break the tie)</span>
              <ul className="list-disc list-outside ml-5 mt-1 text-gray-500 space-y-0.5">
                <li>Overall goal difference across all 3 group matches</li>
                <li>Overall goals scored across all 3 group matches</li>
              </ul>
            </li>
            <li>
              <strong>Fair Play Points</strong>
              <ul className="list-disc list-outside ml-5 mt-1 text-gray-500 space-y-0.5">
                <li>Yellow card: −1 pt</li>
                <li>Two yellows (indirect red): −3 pts</li>
                <li>Direct red card: −4 pts</li>
                <li>Yellow card + direct red: −5 pts</li>
              </ul>
            </li>
            <li>
              <strong>FIFA World Ranking</strong> — higher-ranked team takes the higher spot.
            </li>
          </ol>
          <p className="border-t pt-3 text-xs text-gray-400">
            <strong>Note on 3rd-place ranking:</strong> When comparing the eight best 3rd-place teams
            across groups, head-to-head criteria are skipped. Rankings use: Points → Overall Goal
            Difference → Overall Goals Scored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
