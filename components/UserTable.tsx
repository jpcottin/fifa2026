"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  leagueId: string | null;
  league: { name: string; slug: string } | null;
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
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border flex-wrap">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name ?? "—"}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
            {user.role}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {user.league ? user.league.name : "No league"}
          </Badge>
          {user.id !== currentUserId && (
            <div className="flex gap-2 flex-wrap">
              <select
                className="text-xs border rounded px-1 py-1 bg-white"
                value={user.leagueId ?? ""}
                disabled={loading === user.id}
                onChange={(e) =>
                  patch(user.id, { leagueId: e.target.value || null })
                }
              >
                <option value="">No league</option>
                {leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
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
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
