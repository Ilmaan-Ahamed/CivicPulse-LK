import { auth } from "@clerk/nextjs/server";
import { normalizeRole, type Role } from "@/lib/roles";
import { db } from "@/lib/db";

export async function requireRole(allowed: Role[]) {
  const { userId, sessionClaims } = await auth();
  const claims = sessionClaims as Record<string, unknown> | null | undefined;
  const metadata = claims?.metadata as Record<string, unknown> | undefined;
  const publicMetadata = claims?.publicMetadata as Record<string, unknown> | undefined;
  const roleClaim =
    metadata?.role ?? claims?.role ?? publicMetadata?.role ?? claims?.userRole;
  let role = normalizeRole(typeof roleClaim === "string" ? roleClaim : undefined);

  if (!userId) throw new Error("Unauthorized: not signed in");

  if (!role) {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });
    role = normalizeRole(user?.role);
  }

  if (!role) throw new Error("Unauthorized: role not found in session");
  if (!allowed.includes(role)) {
    throw new Error(`Forbidden: requires one of [${allowed.join(", ")}] but got ${role}`);
  }

  return { userId, role };
}