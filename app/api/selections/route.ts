import { NextResponse } from "next/server";
import { getAuth } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { SELECTION_DEADLINE } from "@/lib/constants";

export async function GET(req: Request) {
  const session = await getAuth(req);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const selections = await prisma.selection.findMany({
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(selections);
}

export async function POST(req: Request) {
  const session = await getAuth(req);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (new Date() >= SELECTION_DEADLINE) {
    return NextResponse.json({ error: "The selection deadline (June 10) has passed" }, { status: 403 });
  }

  const gameState = await prisma.gameState.findUnique({ where: { id: "singleton" } });
  if (gameState?.state !== "PREPARING") {
    return NextResponse.json({ error: "Selections are locked" }, { status: 403 });
  }

  const count = await prisma.selection.count({ where: { userId: session.user.id } });
  if (count >= 3) {
    return NextResponse.json({ error: "Maximum 3 selections allowed" }, { status: 400 });
  }

  const body = await req.json();
  const { name, teamIds } = body as { name: string; teamIds: string[] };

  if (!name?.trim() || teamIds?.length !== 8) {
    return NextResponse.json({ error: "Invalid selection data" }, { status: 400 });
  }

  const teams = await prisma.team.findMany({ where: { id: { in: teamIds } } });
  const sets = teams.map((t) => t.set).sort((a, b) => a - b);
  if (JSON.stringify(sets) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8])) {
    return NextResponse.json({ error: "Must pick exactly one team per set" }, { status: 400 });
  }

  const selection = await prisma.selection.create({
    data: { name: name.trim(), userId: session.user.id, teamIds },
  });
  return NextResponse.json(selection, { status: 201 });
}
