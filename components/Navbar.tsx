"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/teams", label: "Teams" },
  { href: "/matches", label: "Matches" },
];

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight">
            ⚽ FIFA 2026
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-green-200 transition-colors ${
                  pathname === link.href ? "text-white font-semibold underline" : "text-green-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`hover:text-green-200 transition-colors ${
                  pathname.startsWith("/admin") ? "text-white font-semibold underline" : "text-green-100"
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                <AvatarFallback className="bg-green-500 text-white text-xs">
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm hidden md:block">{session.user.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/selections/new")}>
                New Selection
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/leaderboard?mine=1")}>
                My Selections
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login" className="text-sm text-green-100 hover:text-white">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
