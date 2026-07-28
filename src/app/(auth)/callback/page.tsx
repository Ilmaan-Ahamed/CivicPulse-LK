import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Auth Callback Page
 *
 * This page is hit after Clerk sign-in or sign-up.
 * It ensures the user exists in our DB, then routes them:
 *   - New users (no role set yet) â†’ /onboarding
 *   - DS_OFFICER / AGENCY / NGO / ADMIN â†’ /ds-console
 *   - VERIFIER â†’ /verify
 *   - CITIZEN â†’ / (home)
 */
export default async function AuthCallbackPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  // Upsert the user into our database (idempotent)
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
    },
  });

  // Route based on role
  // If the user's metadata marks them as needing onboarding, send there
  const needsOnboarding =
    clerkUser.publicMetadata?.onboardingComplete !== true;

  if (needsOnboarding) {
    redirect("/onboarding");
  }

  switch (user.role) {
    case "DS_OFFICER":
    case "AGENCY":
    case "NGO":
      redirect("/ds-console");
    case "VERIFIER":
      redirect("/verify");
    case "ADMIN":
      redirect("/ds-console");
    default:
      redirect("/");
  }
}


