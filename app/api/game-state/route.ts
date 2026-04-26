import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const state = await prisma.gameState.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(state);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const state = await prisma.gameState.update({
    where: { id: "singleton" },
    data: { state: body.state },
  });
  return NextResponse.json(state);
}
