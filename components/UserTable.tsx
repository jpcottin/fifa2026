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
}

export function UserTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const toggleRole = async (id: string, role: string) => {
    setLoading(id);
    const next = role === "ADMIN" ? "PLAYER" : "ADMIN";
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
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
        <div key={user.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
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
          {user.id !== currentUserId && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleRole(user.id, user.role)}
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
