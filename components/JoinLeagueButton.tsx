"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function JoinLeagueButton({ slug, leagueName }: { slug: string; leagueName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/leagues/${slug}/join`, { method: "POST" });
    if (res.ok) {
      router.push("/leaderboard");
      router.refresh();
    } else {
      const data = await res.json();
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
        {loading ? "Joining…" : `Join ${leagueName}`}
      </Button>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
