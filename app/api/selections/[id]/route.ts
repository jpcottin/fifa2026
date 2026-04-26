import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const selection = await prisma.selection.findUnique({ where: { id } });
  if (!selection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && selection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAdmin) {
    const gameState = await prisma.gameState.findUnique({ where: { id: "singleton" } });
    if (gameState?.state !== "PREPARING") {
      return NextResponse.json({ error: "Cannot delete after game has started" }, { status: 403 });
    }
  }

  await prisma.selection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
