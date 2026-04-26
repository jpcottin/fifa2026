import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Phase, MatchResult } from "@/app/generated/prisma/enums";
import { recalculateAllScores } from "@/lib/scoring";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { team1Id, team2Id, date, phase, winner, team1Goals, team2Goals, note } = body;

  const match = await prisma.match.update({
    where: { id },
    data: {
      team1Id,
      team2Id,
      date: date ? new Date(date) : null,
      phase: phase as Phase,
      winner: winner as MatchResult,
      team1Goals,
      team2Goals,
      note: note || null,
    },
    include: { team1: true, team2: true },
  });

  await recalculateAllScores();

  return NextResponse.json(match);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.match.delete({ where: { id } });
  await recalculateAllScores();
  return NextResponse.json({ ok: true });
}
