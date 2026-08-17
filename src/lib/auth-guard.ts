import { auth } from "@clerk/nextjs/server";
import { normalizeRole, type Role } from "@/lib/roles";

export async function requireRole(allowed: Role[]) {
  const { userId, sessionClaims } = await auth();
  const roleClaim =
    (sessionClaims as any)?.metadata?.role ??
    (sessionClaims as any)?.role ??
    (sessionClaims as any)?.publicMetadata?.role ??
    (sessionClaims as any)?.userRole;
  const role = normalizeRole(roleClaim);

  if (!userId) throw new Error("Unauthorized: not signed in");
  if (role && !allowed.includes(role)) {
    throw new Error(`Forbidden: requires one of [${allowed.join(", ")}]`);
  }

  return { userId, role: role ?? allowed[0] };
}