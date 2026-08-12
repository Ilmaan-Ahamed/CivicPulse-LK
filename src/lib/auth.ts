import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export { ROLE_DASHBOARD } from "@/lib/roles";

// ─── JWT-only helpers (no DB round-trip) ──────────────────────────────────

/**
 * Read the user's role from Clerk JWT session claims.
 * Returns null if not authenticated or no role in claims.
 * Use in Server Components / middleware where DB latency matters.
 */
export async function getCurrentUserRole(): Promise<Role | null> {
  const { sessionClaims } = await auth();
  if (!sessionClaims) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (sessionClaims as any)?.publicMetadata ?? (sessionClaims as any)?.metadata;
  const role = meta?.role as Role | undefined;
  return role ?? null;
}

/**
 * Require a specific role (or one of several roles) — reads from JWT only.
 * Throws if unauthenticated or role doesn't match.
 * Use as secondary gate in Server Actions / API routes.
 */
export async function requireRoleFromClaims(...roles: Role[]): Promise<Role> {
  const role = await getCurrentUserRole();
  if (!role) {
    throw new Error("Unauthorized: Please sign in to continue.");
  }
  if (!roles.includes(role)) {
    throw new Error(
      `Forbidden: Requires one of [${roles.join(", ")}], but you have role ${role}.`
    );
  }
  return role;
}

// ─── DB-backed helpers ─────────────────────────────────────────────────────

/**
 * Get the current authenticated user from the database.
 * Returns null if not authenticated or user not found in DB.
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  return user;
}

/**
 * Require authentication and return the current user.
 * Throws an error if not authenticated.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to continue.");
  }
  return user;
}

/**
 * Require a specific role (or one of several roles) — reads from DB.
 * Use for mutations that need the full user object anyway.
 * Throws an error if the user doesn't have the required role.
 */
export async function requireRole(...roles: Role[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error(
      `Forbidden: This action requires one of the following roles: ${roles.join(", ")}`
    );
  }
  return user;
}

/**
 * Check if the current user has a specific role (DB-backed).
 * Returns false if not authenticated.
 */
export async function hasRole(...roles: Role[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role);
}

// ─── Role hierarchy ────────────────────────────────────────────────────────

/**
 * Role hierarchy for permission checks.
 * Higher numbers = more permissions.
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  CITIZEN: 1,
  VERIFIER: 2,
  VOLUNTEER: 3,
  NGO: 4,
  AGENCY: 5,
  DS_OFFICER: 6,
  ADMIN: 7,
};

/**
 * Check if a user has at least the given role level.
 */
export function hasMinimumRole(userRole: Role, minimumRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

// ─── Clerk sync ────────────────────────────────────────────────────────────

/**
 * Sync Clerk user data to our database.
 * Called from the Clerk webhook on user creation/update.
 */
export async function syncUserToDatabase(clerkUser: {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}) {
  const primaryEmail = clerkUser.email_addresses[0]?.email_address;
  if (!primaryEmail) {
    throw new Error("User must have an email address");
  }

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email: primaryEmail,
      firstName: clerkUser.first_name,
      lastName: clerkUser.last_name,
      avatarUrl: clerkUser.image_url,
    },
    create: {
      clerkId: clerkUser.id,
      email: primaryEmail,
      firstName: clerkUser.first_name,
      lastName: clerkUser.last_name,
      avatarUrl: clerkUser.image_url,
      role: "CITIZEN",
      trustScore: 50,
      preferredLang: "EN",
      onboardingComplete: false,
    },
  });
}
