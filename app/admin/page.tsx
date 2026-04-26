import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GameStateToggle } from "@/components/GameStateToggle";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [gameState, userCount, selectionCount, matchCount] = await Promise.all([
    prisma.gameState.findUnique({ where: { id: "singleton" } }),
    prisma.user.count(),
    prisma.selection.count(),
    prisma.match.count(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-800">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Users", value: userCount },
          { label: "Selections", value: selectionCount },
          { label: "Matches", value: matchCount },
          { label: "State", value: gameState?.state ?? "—" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-700">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Game State</CardTitle></CardHeader>
          <CardContent>
            <GameStateToggle currentState={gameState?.state ?? "PREPARING"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quick Links</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/matches/new">+ Add Match</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/matches">View All Matches</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
