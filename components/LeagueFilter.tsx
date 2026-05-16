"use client";

import { useRouter } from "next/navigation";

interface League {
  id: string;
  name: string;
}

export function LeagueFilter({
  leagues,
  activeLeagueId,
}: {
  leagues: League[];
  activeLeagueId?: string;
}) {
  const router = useRouter();

  return (
    <select
      className="text-xs border rounded px-2 py-1 bg-white"
      value={activeLeagueId ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        router.push(val ? `/leaderboard?league=${val}` : "/leaderboard");
      }}
    >
      <option value="">All leagues</option>
      {leagues.map((l) => (
        <option key={l.id} value={l.id}>
          {l.name}
        </option>
      ))}
    </select>
  );
}
