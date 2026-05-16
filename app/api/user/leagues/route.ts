import { NextResponse } from "next/server";
import { getAuth } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getAuth(req);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { leagues: { select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } } },
  });

  return NextResponse.json(user?.leagues ?? []);
}
