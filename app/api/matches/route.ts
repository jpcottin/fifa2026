import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Phase, MatchResult } from "@/app/generated/prisma/enums";

export async function GET() {
  const matches = await prisma.match.findMany({
    include: {
      team1: true,
      team2: true,
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(matches);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { team1Id, team2Id, date, phase, winner, team1Goals, team2Goals } = body;

  const match = await prisma.match.create({
    data: {
      team1Id,
      team2Id,
      date: date ? new Date(date) : null,
      phase: (phase as Phase) ?? Phase.GROUP,
      winner: (winner as MatchResult) ?? MatchResult.UPCOMING,
      team1Goals: team1Goals ?? 0,
      team2Goals: team2Goals ?? 0,
    },
    include: { team1: true, team2: true },
  });

  return NextResponse.json(match, { status: 201 });
}
