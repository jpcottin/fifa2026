export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { NewSelectionForm } from "@/components/NewSelectionForm";
import { SELECTION_DEADLINE } from "@/lib/constants";

export default async function NewSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  if (new Date() >= SELECTION_DEADLINE) {
    redirect("/leaderboard");
  }

  const gameState = await prisma.gameState.findUnique({ where: { id: "singleton" } });
  if (gameState?.state !== "PREPARING") {
    redirect("/?locked=1");
  }

  const isAdmin = session.user.role === "ADMIN";

  const [user, allLeagues] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { leagues: { select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } } },
    }),
    isAdmin
      ? prisma.league.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } })
      : Promise.resolve(null),
  ]);

  const userLeagues = user?.leagues ?? [];
  const availableLeagues = isAdmin ? (allLeagues ?? []) : userLeagues;

  if (availableLeagues.length === 0) {
    redirect("/leaderboard");
  }

  const params = await searchParams;
  const defaultLeagueId = params.league && availableLeagues.some((l) => l.id === params.league)
    ? params.league
    : availableLeagues[0].id;

  const teams = await prisma.team.findMany({ orderBy: [{ set: "asc" }, { name: "asc" }] });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">New Selection</h1>
      <NewSelectionForm teams={teams} leagues={availableLeagues} defaultLeagueId={defaultLeagueId} />
    </div>
  );
}
