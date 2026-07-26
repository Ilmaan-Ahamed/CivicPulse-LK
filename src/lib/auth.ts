import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

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
 * Require a specific role (or one of several roles).
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
 * Check if the current user has a specific role.
 * Returns false if not authenticated.
 */
export async function hasRole(...roles: Role[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role);
}

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
    },
  });
}
