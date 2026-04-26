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
  if (!isAdmin) {
    return NextResponse.json({ error: "Selections cannot be deleted once submitted" }, { status: 403 });
  }

  await prisma.selection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
