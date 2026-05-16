import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveLeagueId, isNoLeaguePlayer } from "@/lib/league-access";
import { splitMatchCounts } from "@/lib/match-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteSelectionButton } from "@/components/DeleteSelectionButton";
import { LeagueFilter } from "@/components/LeagueFilter";
import Link from "next/link";
import { SELECTION_DEADLINE } from "@/lib/constants";
import { Countdown } from "@/components/Countdown";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mine?: string; league?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const mineOnly = params.mine === "1";
  const isAdmin = session?.user?.role === "ADMIN";

  const currentUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { leagues: { select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } } },
      })
    : null;

  const userLeagues = currentUser?.leagues ?? [];

  const visibleLeagues = isAdmin
    ? await prisma.league.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } })
    : userLeagues;

  const activeLeagueId = getActiveLeagueId(params.league, userLeagues, isAdmin);
  const noLeaguePlayer = isNoLeaguePlayer(userLeagues, isAdmin);

  const activeLeague = activeLeagueId
    ? await prisma.league.findUnique({ where: { id: activeLeagueId }, select: { id: true, name: true, slug: true } })
    : null;

  const selectionWhere = {
    ...(mineOnly && session?.user?.id ? { userId: session.user.id } : {}),
    ...(activeLeagueId ? { leagueId: activeLeagueId } : {}),
  };

  const [selections, teams, gameState, matchWinners] = await Promise.all([
    noLeaguePlayer
      ? Promise.resolve([] as Awaited<ReturnType<typeof prisma.selection.findMany<{ include: { user: { select: { name: true; image: true } } } }>>>)
      : prisma.selection.findMany({
          where: selectionWhere,
          include: { user: { select: { name: true, image: true } } },
          orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        }),
    prisma.team.findMany(),
    prisma.gameState.findUnique({ where: { id: "singleton" } }),
    prisma.match.findMany({ select: { winner: true } }),
  ]);

  const { played: playedCount, upcoming: upcomingCount } = splitMatchCounts(
    matchWinners.map((m) => m.winner),
  );

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const isPreparing = gameState?.state === "PREPARING";
  const isPastDeadline = new Date() >= SELECTION_DEADLINE;
  const canShowCountdown = mineOnly && isPreparing && !isPastDeadline && selections.length < 3;

  const ranked = selections.reduce<(typeof selections[number] & { rank: number })[]>(
    (acc, sel, idx) => {
      const prev = acc[idx - 1];
      const rank = prev === undefined ? 1 : sel.score < prev.score ? idx + 1 : prev.rank;
      return [...acc, { ...sel, rank }];
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-green-800">
            {mineOnly ? "My Selections" : activeLeague ? activeLeague.name : "Leaderboard"}
          </h1>
          {!mineOnly && activeLeague && (
            <p className="text-xs text-gray-500">League leaderboard</p>
          )}
          {userLeagues.length === 0 && !isAdmin && session && (
            <p className="text-sm text-gray-500 mt-1">
              Join a league to see its leaderboard.
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {visibleLeagues.length > 0 && (
            <LeagueFilter leagues={visibleLeagues} activeLeagueId={activeLeagueId} />
          )}
          <Button asChild variant={mineOnly ? "default" : "outline"} size="sm">
            <Link href={activeLeagueId && isAdmin ? `/leaderboard?mine=1&league=${activeLeagueId}` : "/leaderboard?mine=1"}>
              Mine
            </Link>
          </Button>
          <Button asChild variant={mineOnly ? "outline" : "default"} size="sm">
            <Link href={activeLeagueId && isAdmin ? `/leaderboard?league=${activeLeagueId}` : "/leaderboard"}>
              All
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Matches Played</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-700">{playedCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Matches to Go</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-gray-400">{upcomingCount}</p></CardContent>
        </Card>
      </div>

      {canShowCountdown && <Countdown deadlineMs={SELECTION_DEADLINE.getTime()} />}

      {ranked.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No selections yet.</p>
      ) : (
        <div className="space-y-2">
          {ranked.map((sel) => {
            const selTeams = sel.teamIds.map((id) => teamMap.get(id)).filter(Boolean);
            const canDelete = isAdmin;
            return (
              <div
                key={sel.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-green-200 transition-colors"
              >
                <span className="text-lg font-bold text-gray-400 w-8 text-center">
                  {sel.rank === 1 ? "🥇" : sel.rank === 2 ? "🥈" : sel.rank === 3 ? "🥉" : `#${sel.rank}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{sel.name}</p>
                  <p className="text-xs text-gray-500">{sel.user.name}</p>
                </div>
                <div className="flex gap-0.5 shrink-0 whitespace-nowrap">
                  {selTeams.map(
                    (t) =>
                      t && (
                        <span
                          key={t.id}
                          title={`${t.name} (${t.score.toFixed(1)} pts)`}
                          className="text-3xl cursor-default"
                        >
                          {t.flagEmoji}
                        </span>
                      )
                  )}
                </div>
                <Badge variant="outline" className="font-mono text-green-700 border-green-300">
                  {sel.score.toFixed(1)}
                </Badge>
                {canDelete && <DeleteSelectionButton id={sel.id} />}
              </div>
            );
          })}
        </div>
      )}

      {isPreparing && !isPastDeadline && !noLeaguePlayer && (
        <div className="text-center pt-4">
          <Button asChild className="bg-green-700 hover:bg-green-800">
            <Link href={activeLeagueId ? `/selections/new?league=${activeLeagueId}` : "/selections/new"}>
              + New Selection
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
