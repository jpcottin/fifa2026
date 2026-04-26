import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const teams = await prisma.team.findMany({ orderBy: [{ score: "desc" }, { name: "asc" }] });
  return NextResponse.json(teams);
}
