import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId") ?? undefined;

  const selWhere = leagueId ? { leagueId } : {};
  const [totalSelections, totalPlayers] = await Promise.all([
    prisma.selection.count({ where: selWhere }),
    prisma.user.count({ where: { selections: { some: leagueId ? { leagueId } : {} } } }),
  ]);
  return NextResponse.json({ totalPlayers, totalSelections });
}
