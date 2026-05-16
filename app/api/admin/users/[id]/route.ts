import { NextResponse } from "next/server";
import { getAuth } from "@/lib/mobile-auth";
import { prisma } from "@/lib/db";
import { Role } from "@/app/generated/prisma/enums";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuth(req);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  const leaguesUpdate: { connect?: { id: string }; disconnect?: { id: string } } = {};
  if (body.addLeagueId) leaguesUpdate.connect = { id: body.addLeagueId };
  if (body.removeLeagueId) leaguesUpdate.disconnect = { id: body.removeLeagueId };

  const data: { role?: Role; leagues?: typeof leaguesUpdate } = {};
  if (body.role !== undefined) data.role = body.role as Role;
  if (body.addLeagueId || body.removeLeagueId) data.leagues = leaguesUpdate;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, leagues: { select: { id: true, name: true, slug: true } } },
  });
  return NextResponse.json(user);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuth(req);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
