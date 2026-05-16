"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserLeague {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  leagues: UserLeague[];
}

interface League {
  id: string;
  name: string;
  slug: string;
}

export function UserTable({
  users,
  currentUserId,
  leagues,
}: {
  users: User[];
  currentUserId: string;
  leagues: League[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const patch = async (id: string, body: object) => {
    setLoading(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(null);
    router.refresh();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user and all their selections?")) return;
    setLoading(id);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {users.map((user) => {
        const memberIds = new Set(user.leagues.map((l) => l.id));
        const available = leagues.filter((l) => !memberIds.has(l.id));

        return (
          <div key={user.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border flex-wrap">
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback>{user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name ?? "—"}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.leagues.map((l) => (
                  <span
                    key={l.id}
                    className="inline-flex items-center gap-1 text-xs bg-green-50 border border-green-200 text-green-800 rounded-full px-2 py-0.5"
                  >
                    {l.name}
                    {user.id !== currentUserId && (
                      <button
                        onClick={() => patch(user.id, { removeLeagueId: l.id })}
                        disabled={loading === user.id}
                        className="text-green-600 hover:text-red-500 leading-none"
                        title={`Remove from ${l.name}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {user.leagues.length === 0 && (
                  <span className="text-xs text-gray-400 italic">No leagues</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              {user.id !== currentUserId && (
                <>
                  {available.length > 0 && (
                    <select
                      className="text-xs border rounded px-1 py-1 bg-white"
                      value=""
                      disabled={loading === user.id}
                      onChange={(e) => {
                        if (e.target.value) patch(user.id, { addLeagueId: e.target.value });
                      }}
                    >
                      <option value="">+ Add to league</option>
                      {available.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => patch(user.id, { role: user.role === "ADMIN" ? "PLAYER" : "ADMIN" })}
                    disabled={loading === user.id}
                  >
                    {user.role === "ADMIN" ? "Make Player" : "Make Admin"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-600"
                    onClick={() => deleteUser(user.id)}
                    disabled={loading === user.id}
                  >
                    ✕
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
