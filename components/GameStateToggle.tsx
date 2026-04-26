"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function GameStateToggle({ currentState }: { currentState: string }) {
  const router = useRouter();
  const [state, setState] = useState(currentState);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = state === "PREPARING" ? "STARTED" : "PREPARING";
    setLoading(true);
    const res = await fetch("/api/game-state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: next }),
    });
    setLoading(false);
    if (res.ok) {
      setState(next);
      router.refresh();
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Badge variant={state === "PREPARING" ? "default" : "secondary"}>
        {state === "PREPARING" ? "🟢 Selections Open" : "🔴 Competition In Progress"}
      </Badge>
      <Button variant="outline" size="sm" onClick={toggle} disabled={loading}>
        {loading ? "Updating…" : state === "PREPARING" ? "Lock & Start" : "Reopen Selections"}
      </Button>
    </div>
  );
}
