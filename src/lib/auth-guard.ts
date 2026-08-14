import { auth } from "@clerk/nextjs/server";
import type { Role } from "@/lib/roles";

export async function requireRole(allowed: Role[]) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as any)?.role as Role | undefined;

  if (!userId) throw new Error("Unauthorized: not signed in");
  if (!role || !allowed.includes(role)) {
    throw new Error(`Forbidden: requires one of [${allowed.join(", ")}]`);
  }

  return { userId, role };
}