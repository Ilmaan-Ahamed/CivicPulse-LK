import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ROLE_DASHBOARD } from "@/lib/auth";

/**
 * Auth Callback Page
 *
<<<<<<< HEAD
 * This page is hit after Clerk sign-in or sign-up.
 * It ensures the user exists in our DB, then routes them:
 *   - New users (no role set yet) â†’ /onboarding
 *   - DS_OFFICER / AGENCY / NGO / ADMIN â†’ /ds-console
 *   - VERIFIER â†’ /verify
 *   - CITIZEN â†’ / (home)
=======
 * Hit after Clerk sign-in or sign-up (signInFallbackRedirectUrl / signUpFallbackRedirectUrl).
 *
 * Flow:
 *  1. Upsert the user into our DB (idempotent).
 *  2. If onboarding is not yet complete → /onboarding.
 *  3. Route to the role's dashboard root using ROLE_DASHBOARD map:
 *       CITIZEN / VERIFIER / VOLUNTEER → /citizen
 *       NGO                            → /ngo
 *       AGENCY                         → /agency
 *       DS_OFFICER                     → /ds-officer
 *       ADMIN                          → /admin
>>>>>>> 7548f6d (Update CivicPulse development features)
 */
export default async function AuthCallbackPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  // Upsert user into our DB (idempotent — safe to call on every login)
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
      role: "CITIZEN",
      trustScore: 50,
      preferredLang: "EN",
      onboardingComplete: false,
    },
  });

  // ── Onboarding gate ──────────────────────────────────────────────────────
  // Check both Clerk metadata (fast) and DB flag (fallback for lag).
  const metaComplete = clerkUser.publicMetadata?.onboardingComplete === true;
  const dbComplete = user.onboardingComplete;

  if (!metaComplete && !dbComplete) {
    redirect("/onboarding");
  }

  // ── Role-based routing ───────────────────────────────────────────────────
  const destination = ROLE_DASHBOARD[user.role] ?? "/citizen";
  redirect(destination);
}


