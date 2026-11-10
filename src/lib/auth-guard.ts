import { auth } from "@clerk/nextjs/server";
import { normalizeRole, type Role } from "@/lib/roles";
import { db } from "@/lib/db";

export async function requireRole(allowed: Role[]) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized: not signed in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  const role = normalizeRole(user?.role);

  if (!role) throw new Error("Unauthorized: role not found in user record");
  if (!allowed.includes(role)) {
    throw new Error(`Forbidden: requires one of [${allowed.join(", ")}] but got ${role}`);
  }

  return { userId, role };
}