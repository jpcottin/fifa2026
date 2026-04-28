"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function GameStateToggle({ currentState }: { currentState: string }) {
  const router = useRouter();
  const [state, setState] = useState(currentState);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
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

  const isStarted = state === "STARTED";

  return (
    <div className="flex flex-col gap-4">
      <div 
        onClick={toggle}
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
          isStarted 
            ? "bg-green-50 border-green-500 shadow-sm" 
            : "bg-gray-50 border-gray-200 hover:border-gray-300"
        )}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-900">Competition Started</span>
          <span className="text-sm text-gray-500">
            {isStarted 
              ? "Live mode active. Selections are now locked." 
              : "In preparation. Users can still create and edit picks."}
          </span>
        </div>
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
          loading && "animate-spin opacity-50"
        )}>
          {isStarted ? (
            <CheckCircle2 className="w-8 h-8 text-green-600 fill-green-50" />
          ) : (
            <Circle className="w-8 h-8 text-gray-300" />
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant={isStarted ? "secondary" : "default"}>
          Status: {state}
        </Badge>
        {loading && <span className="text-xs text-gray-400 animate-pulse">Syncing with server...</span>}
      </div>
    </div>
  );
}
