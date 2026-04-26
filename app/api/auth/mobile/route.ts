import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { prisma } from "@/lib/db";

async function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET!);
}

export async function POST(req: Request) {
  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  // Verify Google ID token
  const googleRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  if (!googleRes.ok) {
    return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
  }
  const googlePayload = await googleRes.json();

  const { email, name, picture, sub: googleId } = googlePayload;
  if (!email) {
    return NextResponse.json({ error: "Google token missing email" }, { status: 401 });
  }

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        image: picture ?? null,
        role: "PLAYER",
        accounts: {
          create: {
            type: "oauth",
            provider: "google",
            providerAccountId: googleId,
          },
        },
      },
    });
  }

  // Sign JWT
  const secret = await getSecret();
  const token = await new SignJWT({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    image: user.image,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return NextResponse.json({ token });
}
