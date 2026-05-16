import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateLeagueForm } from "@/components/CreateLeagueForm";
import { CopyUrlButton } from "@/components/CopyUrlButton";

export const dynamic = "force-dynamic";

export default async function AdminLeaguesPage() {
  const leagues = await prisma.league.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-800">Leagues</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">← Admin</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create League</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateLeagueForm />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {leagues.length === 0 && (
          <p className="text-gray-500 text-center py-8">No leagues yet.</p>
        )}
        {leagues.map((league) => (
          <div
            key={league.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{league.name}</p>
              <p className="text-xs text-gray-500">
                /{league.slug} · {league._count.users} member
                {league._count.users !== 1 ? "s" : ""}
              </p>
            </div>
            <CopyUrlButton slug={league.slug} />
          </div>
        ))}
      </div>
    </div>
  );
}
