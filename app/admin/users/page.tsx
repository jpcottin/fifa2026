import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { UserTable } from "@/components/UserTable";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-green-800">Users</h1>
      <UserTable users={users} currentUserId={session!.user.id} />
    </div>
  );
}
