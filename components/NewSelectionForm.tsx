"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SETS } from "@/lib/groups";

interface Team {
  id: string;
  name: string;
  set: number;
  flagEmoji: string;
}

interface Props {
  teams: Team[];
}

export function NewSelectionForm({ teams }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [picks, setPicks] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    for (const s of SETS) {
      const first = teams.find((t) => t.set === s.set);
      if (first) initial[s.set] = first.id;
    }
    return initial;
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter a selection name"); return; }
    const teamIds = Object.values(picks);
    if (teamIds.length !== 8) { setError("Pick one team per set"); return; }

    setLoading(true);
    const res = await fetch("/api/selections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), teamIds }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save selection");
      return;
    }
    router.push("/leaderboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Selection Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My Dream Team"
          maxLength={40}
        />
      </div>

      {SETS.map((s) => {
        const setTeams = teams.filter((t) => t.set === s.set);
        return (
          <Card key={s.set}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {setTeams.map((team) => {
                  const selected = picks[s.set] === team.id;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => setPicks((p) => ({ ...p, [s.set]: team.id }))}
                      className={`flex items-center gap-2 p-2 rounded-md border text-sm transition-all ${
                        selected
                          ? "border-green-600 bg-green-50 font-semibold text-green-800"
                          : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{team.flagEmoji}</span>
                      <span className="truncate">{team.name}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={loading}>
        {loading ? "Saving…" : "Save Selection"}
      </Button>
    </form>
  );
}
