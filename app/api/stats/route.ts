import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [totalSelections, totalPlayers] = await Promise.all([
    prisma.selection.count(),
    prisma.user.count({ where: { selections: { some: {} } } }),
  ]);
  return NextResponse.json({ totalPlayers, totalSelections });
}
