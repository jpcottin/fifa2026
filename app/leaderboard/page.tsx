import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteSelectionButton } from "@/components/DeleteSelectionButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mine?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const mineOnly = params.mine === "1";

  const [selections, teams, gameState] = await Promise.all([
    prisma.selection.findMany({
      where: mineOnly && session?.user?.id ? { userId: session.user.id } : {},
      include: { user: { select: { name: true, image: true } } },
      orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    }),
    prisma.team.findMany(),
    prisma.gameState.findUnique({ where: { id: "singleton" } }),
  ]);

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const isPreparing = gameState?.state === "PREPARING";
  const isAdmin = session?.user?.role === "ADMIN";

  let rank = 1;
  const ranked = selections.map((sel, idx) => {
    if (idx > 0 && sel.score < selections[idx - 1].score) rank = idx + 1;
    return { ...sel, rank };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-800">
          {mineOnly ? "My Selections" : "Leaderboard"}
        </h1>
        <div className="flex gap-2">
          <Button asChild variant={mineOnly ? "default" : "outline"} size="sm">
            <Link href="/leaderboard?mine=1">Mine</Link>
          </Button>
          <Button asChild variant={mineOnly ? "outline" : "default"} size="sm">
            <Link href="/leaderboard">All</Link>
          </Button>
        </div>
      </div>

      {ranked.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No selections yet.</p>
      ) : (
        <div className="space-y-2">
          {ranked.map((sel) => {
            const selTeams = sel.teamIds.map((id) => teamMap.get(id)).filter(Boolean);
            const canDelete =
              (isPreparing && sel.userId === session?.user?.id) || isAdmin;
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

      {isPreparing && (
        <div className="text-center pt-4">
          <Button asChild className="bg-green-700 hover:bg-green-800">
            <Link href="/selections/new">+ New Selection</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
