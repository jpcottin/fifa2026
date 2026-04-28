import { NextResponse } from "next/server";
import { getAuth } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { Phase, MatchResult } from "@/app/generated/prisma/enums";
import { recalculateAllScores } from "@/lib/scoring";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuth(req);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  
  const updateData: any = {};
  if (body.team1Id !== undefined) updateData.team1Id = body.team1Id;
  if (body.team2Id !== undefined) updateData.team2Id = body.team2Id;
  if (body.date !== undefined) updateData.date = body.date ? new Date(body.date) : null;
  if (body.phase !== undefined) updateData.phase = body.phase as Phase;
  if (body.winner !== undefined) updateData.winner = body.winner as MatchResult;
  if (body.team1Goals !== undefined) updateData.team1Goals = body.team1Goals;
  if (body.team2Goals !== undefined) updateData.team2Goals = body.team2Goals;
  if (body.note !== undefined) updateData.note = body.note;

  const match = await prisma.match.update({
    where: { id },
    data: updateData,
    include: { team1: true, team2: true },
  });

  await recalculateAllScores();

  return NextResponse.json(match);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuth(req);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.match.delete({ where: { id } });
  await recalculateAllScores();
  return NextResponse.json({ ok: true });
}
