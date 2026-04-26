import { jwtVerify } from "jose";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

type MobileSession = {
  user: {
    id: string;
    role: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

async function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET!);
}

export async function getAuth(req: Request): Promise<Session | MobileSession | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const secret = await getSecret();
      const { payload } = await jwtVerify(token, secret);
      if (!payload.id) return null;
      return {
        user: {
          id: payload.id as string,
          role: (payload.role as string) ?? "PLAYER",
          name: (payload.name as string) ?? null,
          email: (payload.email as string) ?? null,
          image: (payload.image as string) ?? null,
        },
      };
    } catch {
      return null;
    }
  }
  return auth();
}
