import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const publicPaths = ["/login", "/api/auth"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  // Allow mobile clients using Bearer token auth to reach API routes
  const hasBearerToken = req.headers.get("Authorization")?.startsWith("Bearer ");
  if (hasBearerToken && pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const isAdmin = req.auth?.user?.role === "ADMIN";
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
