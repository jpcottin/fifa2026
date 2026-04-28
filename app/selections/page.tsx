export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SelectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const hitLimit = params.limit === "1";

  const selectionCount = await prisma.selection.count({
    where: { userId: session.user.id },
  });

  return (
    <div className="max-w-lg mx-auto text-center space-y-6 py-16">
      <div className="text-6xl">🏆</div>
      <h1 className="text-2xl font-bold text-green-800">
        {hitLimit ? "You've used all your selections" : "Your selections"}
      </h1>
      <p className="text-gray-600 text-base leading-relaxed">
        {hitLimit ? (
          <>
            You already have <strong>{selectionCount} selections</strong> — that&apos;s the maximum
            of 3. You can&apos;t create more, but you can still follow your picks on the leaderboard.
          </>
        ) : (
          <>
            You have <strong>{selectionCount} of 3</strong> selections. Head to the leaderboard to
            see them, or create a new one while spots are open.
          </>
        )}
      </p>
      <div className="flex justify-center gap-3">
        <Button asChild className="bg-green-700 hover:bg-green-800">
          <Link href="/leaderboard?mine=1">View my selections</Link>
        </Button>
        {!hitLimit && (
          <Button asChild variant="outline">
            <Link href="/selections/new">New selection</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
