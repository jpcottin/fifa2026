import { NextResponse } from "next/server";
import { getAuth } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { normalizeSlug, isValidSlug } from "@/lib/leagues";

export async function GET(req: Request) {
  const session = await getAuth(req);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const leagues = await prisma.league.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(leagues);
}

export async function POST(req: Request) {
  const session = await getAuth(req);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, slug: rawSlug } = await req.json() as { name?: string; slug?: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = rawSlug?.trim() ? rawSlug.trim() : normalizeSlug(name.trim());

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Slug must be 1–32 lowercase alphanumeric characters or hyphens" },
      { status: 400 }
    );
  }

  const existing = await prisma.league.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A league with that slug already exists" }, { status: 409 });
  }

  const league = await prisma.league.create({ data: { name: name.trim(), slug } });
  return NextResponse.json(league, { status: 201 });
}
