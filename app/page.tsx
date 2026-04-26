export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const session = await auth();
  const gameState = await prisma.gameState.findUnique({ where: { id: "singleton" } });
  const isPreparing = gameState?.state === "PREPARING";

  const totalSelections = await prisma.selection.count();
  const totalPlayers = await prisma.user.count({ where: { role: "PLAYER" } });

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-green-800">⚽ FIFA World Cup 2026</h1>
        <p className="text-xl text-gray-600">Pick Your 8 · Follow Every Match · Win the Bragging Rights</p>
        <Badge variant={isPreparing ? "default" : "secondary"} className="text-sm">
          {isPreparing ? "🟢 Selections Open" : "🔴 Competition in Progress"}
        </Badge>
      </div>

      {isPreparing && (
        <div className="flex justify-center">
          <Button asChild size="lg" className="bg-green-700 hover:bg-green-800">
            <Link href="/selections/new">Pick My 8 Teams →</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Players</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-700">{totalPlayers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Selections</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-700">{totalSelections}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Teams</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-700">48</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Sets</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-700">8</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-800">1. Pick Your 8 Teams</h3>
              <p className="text-sm">
                48 qualified nations are divided into 8 Sets of 6, ranked by the official
                FIFA rankings of April 2026. You pick <strong>one team per set</strong> for
                a total of 8 teams.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-800">2. Earn Points</h3>
              <p className="text-sm">Each of your teams earns points throughout the tournament:</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li><strong>Win</strong>: +3 pts</li>
                <li><strong>Draw</strong>: +1 pt</li>
                <li><strong>Goals (group stage)</strong>: +0.3 pts each</li>
                <li><strong>Goals (knockout)</strong>: +0.5 pts each</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-800">3. Your Score = Sum of Your 8 Teams</h3>
              <p className="text-sm">The more your teams win and score, the higher you climb the leaderboard. You can create up to <strong>3 selections</strong>.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-800">4. Follow Live Results</h3>
              <p className="text-sm">Once the tournament starts, results are updated after each match. Check the leaderboard and team scores anytime.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!session && (
        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign in with Google to participate</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
