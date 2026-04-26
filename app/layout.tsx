import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { auth } from "@/lib/auth";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "FIFA 2026 – Pick Your 8",
  description: "Pick 8 teams (one per set) and follow the World Cup 2026",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar session={session} />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-4">
          FIFA 2026 · Pick Your 8
        </footer>
      </body>
    </html>
  );
}
