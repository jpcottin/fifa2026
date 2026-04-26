"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Team { id: string; name: string; set: number; flagEmoji: string; }

interface MatchData {
  id?: string;
  team1Id: string;
  team2Id: string;
  date: string;
  phase: string;
  winner: string;
  team1Goals: number;
  team2Goals: number;
  note?: string;
}

const PHASES = [
  { value: "GROUP", label: "Group Stage" },
  { value: "R32", label: "Round of 32" },
  { value: "R16", label: "Round of 16" },
  { value: "QF", label: "Quarter-final" },
  { value: "SF", label: "Semi-final" },
  { value: "THIRD", label: "Third Place Play-off" },
  { value: "FINAL", label: "Final" },
];

const RESULTS = [
  { value: "UPCOMING", label: "Upcoming / TBD" },
  { value: "TEAM1", label: "Team 1 Wins" },
  { value: "TEAM2", label: "Team 2 Wins" },
  { value: "DRAW", label: "Draw" },
];

export function MatchForm({ teams, match }: { teams: Team[]; match?: MatchData }) {
  const router = useRouter();
  const isEdit = !!match?.id;

  const [form, setForm] = useState<MatchData>({
    team1Id: match?.team1Id ?? teams[0]?.id ?? "",
    team2Id: match?.team2Id ?? teams[1]?.id ?? "",
    date: match?.date ?? "",
    phase: match?.phase ?? "GROUP",
    winner: match?.winner ?? "UPCOMING",
    team1Goals: match?.team1Goals ?? 0,
    team2Goals: match?.team2Goals ?? 0,
    note: match?.note ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: keyof MatchData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: field.endsWith("Goals") ? Number(e.target.value) : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.team1Id === form.team2Id) { setError("Teams must be different"); return; }
    setError("");
    setLoading(true);

    const url = isEdit ? `/api/matches/${match!.id}` : "/api/matches";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error"); return; }
    router.push("/matches");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!match?.id || !confirm("Delete this match?")) return;
    setLoading(true);
    await fetch(`/api/matches/${match.id}`, { method: "DELETE" });
    setLoading(false);
    router.push("/matches");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-4">
          {form.note && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 italic">
              {form.note}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Team 1</Label>
              <select value={form.team1Id} onChange={set("team1Id")} className="w-full rounded-md border p-2 text-sm">
                {teams.map((t) => <option key={t.id} value={t.id}>{t.flagEmoji} {t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Team 2</Label>
              <select value={form.team2Id} onChange={set("team2Id")} className="w-full rounded-md border p-2 text-sm">
                {teams.map((t) => <option key={t.id} value={t.id}>{t.flagEmoji} {t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Phase</Label>
              <select value={form.phase} onChange={set("phase")} className="w-full rounded-md border p-2 text-sm">
                {PHASES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Date &amp; Time</Label>
              <Input type="datetime-local" value={form.date} onChange={set("date")} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Result</Label>
            <select value={form.winner} onChange={set("winner")} className="w-full rounded-md border p-2 text-sm">
              {RESULTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {form.winner !== "UPCOMING" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Team 1 Goals</Label>
                <Input type="number" min={0} value={form.team1Goals} onChange={set("team1Goals")} />
              </div>
              <div className="space-y-1">
                <Label>Team 2 Goals</Label>
                <Input type="number" min={0} value={form.team2Goals} onChange={set("team2Goals")} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1 bg-green-700 hover:bg-green-800" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Update Match" : "Add Match"}
        </Button>
        {isEdit && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
