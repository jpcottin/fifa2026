import { NextResponse } from "next/server";
import { getAuth } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getAuth(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const league = await prisma.league.findUnique({ where: { slug } });
    if (!league) return NextResponse.json({ error: "League not found" }, { status: 404 });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { leagues: { connect: { id: league.id } } },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
