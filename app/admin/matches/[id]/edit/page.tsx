export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { MatchForm } from "@/components/MatchForm";

export default async function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [match, teams] = await Promise.all([
    prisma.match.findUnique({ where: { id }, include: { team1: true, team2: true } }),
    prisma.team.findMany({ orderBy: [{ set: "asc" }, { name: "asc" }] }), // includes TBD teams (set=0)
  ]);
  if (!match) notFound();

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Edit Match</h1>
      <MatchForm
        teams={teams}
        match={{
          id: match.id,
          team1Id: match.team1Id,
          team2Id: match.team2Id,
          date: match.date?.toISOString().slice(0, 16) ?? "",
          phase: match.phase,
          winner: match.winner,
          team1Goals: match.team1Goals,
          team2Goals: match.team2Goals,
          note: match.note ?? "",
        }}
      />
    </div>
  );
}
