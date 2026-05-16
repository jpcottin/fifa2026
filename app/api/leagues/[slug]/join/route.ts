import { NextResponse } from "next/server";
import { getAuth } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getAuth(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const league = await prisma.league.findUnique({ where: { slug } });
  if (!league) return NextResponse.json({ error: "League not found" }, { status: 404 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { league: { select: { name: true, slug: true } } },
  });

  if (user?.leagueId && user.leagueId !== league.id) {
    return NextResponse.json(
      { error: `You are already in the "${user.league?.name}" league` },
      { status: 400 }
    );
  }

  if (user?.leagueId === league.id) {
    return NextResponse.json({ ok: true, alreadyMember: true });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { leagueId: league.id },
  });

  return NextResponse.json({ ok: true });
}
