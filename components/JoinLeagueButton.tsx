"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function JoinLeagueButton({ slug, leagueName, leagueId }: { slug: string; leagueName: string; leagueId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/leagues/${slug}/join`, { method: "POST" });
    if (res.ok) {
      const dest = leagueId ? `/leaderboard?league=${leagueId}` : "/leaderboard";
      router.push(dest);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={join}
        disabled={loading}
        className="bg-green-700 hover:bg-green-800 w-full"
      >
        {loading ? "Joining…" : `Join ${leagueName} as player`}
      </Button>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
