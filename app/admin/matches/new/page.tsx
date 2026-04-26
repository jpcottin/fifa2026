export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { MatchForm } from "@/components/MatchForm";

export default async function NewMatchPage() {
  const teams = await prisma.team.findMany({ orderBy: [{ set: "asc" }, { name: "asc" }] });
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Add Match</h1>
      <MatchForm teams={teams} />
    </div>
  );
}
