import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const PHASE_LABELS: Record<string, string> = {
  GROUP: "Group Stage",
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-final",
  SF: "Semi-final",
  THIRD: "Third Place Play-off",
  FINAL: "Final",
};

const RESULT_LABELS: Record<string, string> = {
  UPCOMING: "Upcoming",
  TEAM1: "Team 1 Win",
  TEAM2: "Team 2 Win",
  DRAW: "Draw",
};

const phaseOrder = ["GROUP", "R32", "R16", "QF", "SF", "THIRD", "FINAL"];

export default async function MatchesPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const matches = await prisma.match.findMany({
    include: { team1: true, team2: true },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const byPhase = matches.reduce<Record<string, typeof matches>>((acc, m) => {
    acc[m.phase] = acc[m.phase] ?? [];
    acc[m.phase].push(m);
    return acc;
  }, {});

  const isTbd = (name: string) => name.startsWith("TBD");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-800">Matches</h1>
        {isAdmin && (
          <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
            <Link href="/admin/matches/new">+ Add Match</Link>
          </Button>
        )}
      </div>

      {matches.length === 0 && (
        <p className="text-gray-500 text-center py-8">No matches recorded yet.</p>
      )}

      {phaseOrder
        .filter((p) => byPhase[p])
        .map((phase) => (
          <div key={phase}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {PHASE_LABELS[phase]}
            </h2>
            <div className="space-y-2">
              {byPhase[phase].map((match) => {
                const pending = isTbd(match.team1.name) || isTbd(match.team2.name);
                return (
                  <div
                    key={match.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                  >
                    {pending ? (
                      <div className="flex-1 text-sm text-gray-400 italic">
                        {match.note ?? "TBD vs TBD"}
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 flex items-center gap-2 justify-end">
                          <span className="text-sm font-medium">{match.team1.name}</span>
                          <span className="text-xl">{match.team1.flagEmoji}</span>
                        </div>
                        <div className="text-center min-w-[80px]">
                          {match.winner === "UPCOMING" ? (
                            <span className="text-xs text-gray-400">
                              {match.date ? new Date(match.date).toLocaleDateString() : "TBD"}
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-lg">
                              {match.team1Goals} – {match.team2Goals}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-xl">{match.team2.flagEmoji}</span>
                          <span className="text-sm font-medium">{match.team2.name}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-2 shrink-0">
                      {!pending && (
                        <Badge
                          variant={match.winner === "UPCOMING" ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {match.winner === "TEAM1"
                            ? match.team1.name
                            : match.winner === "TEAM2"
                            ? match.team2.name
                            : RESULT_LABELS[match.winner]}
                        </Badge>
                      )}
                      {pending && match.date && (
                        <span className="text-xs text-gray-400">
                          {new Date(match.date).toLocaleDateString()}
                        </span>
                      )}
                      {isAdmin && (
                        <Button asChild variant="ghost" size="sm" className="text-xs">
                          <Link href={`/admin/matches/${match.id}/edit`}>Edit</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
