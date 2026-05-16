import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JoinLeagueButton } from "@/components/JoinLeagueButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [league, session] = await Promise.all([
    prisma.league.findUnique({
      where: { slug },
      include: { _count: { select: { users: true } } },
    }),
    auth(),
  ]);

  if (!league) notFound();

  const isAdmin = session?.user?.role === "ADMIN";

  const isMember = session?.user?.id
    ? !!(await prisma.user.findFirst({
        where: { id: session.user.id, leagues: { some: { id: league.id } } },
      }))
    : false;

  if (isMember && !isAdmin) {
    redirect(`/leaderboard?league=${league.id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="text-center space-y-2">
        <p className="text-5xl">⚽</p>
        <h1 className="text-3xl font-bold text-green-800">{league.name}</h1>
        <p className="text-gray-500">
          FIFA 2026 · Pick Your 8 · {league._count.users} member
          {league._count.users !== 1 ? "s" : ""}
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base text-center">
            {isAdmin ? "Admin view" : !session ? "Sign in to join" : "Join this league"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isAdmin && (
            <div className="flex flex-col gap-2">
              <Button asChild className="bg-green-700 hover:bg-green-800 w-full">
                <Link href={`/leaderboard?league=${league.id}`}>View leaderboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/leagues">Manage leagues</Link>
              </Button>
              <hr className="my-1" />
              <JoinLeagueButton slug={slug} leagueName={league.name} leagueId={league.id} />
            </div>
          )}

          {!isAdmin && !session && (
            <Button asChild className="bg-green-700 hover:bg-green-800 w-full">
              <Link href={`/login?callbackUrl=/league/${slug}`}>Sign in with Google</Link>
            </Button>
          )}

          {!isAdmin && session && (
            <JoinLeagueButton slug={slug} leagueName={league.name} leagueId={league.id} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
