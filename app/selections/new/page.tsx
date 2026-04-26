export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { NewSelectionForm } from "@/components/NewSelectionForm";

export default async function NewSelectionPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const gameState = await prisma.gameState.findUnique({ where: { id: "singleton" } });
  if (gameState?.state !== "PREPARING") {
    redirect("/?locked=1");
  }

  const selectionCount = await prisma.selection.count({ where: { userId: session.user.id } });
  if (selectionCount >= 3) {
    redirect("/selections?limit=1");
  }

  const teams = await prisma.team.findMany({ orderBy: [{ set: "asc" }, { name: "asc" }] });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">New Selection</h1>
      <NewSelectionForm teams={teams} />
    </div>
  );
}
