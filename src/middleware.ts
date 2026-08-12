import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";

<<<<<<< HEAD
// Public routes — no auth required
const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/dashboard",
  "/modules",
  "/onboarding",
  "/callback",
  "/api/webhooks",
  "/api/dashboard",
  "/api/onboarding",
=======
// ─── Role dashboard map ────────────────────────────────────────────────────
// Single source of truth: where each role lands after login or a mismatch.
const ROLE_DASHBOARD: Record<string, string> = {
  CITIZEN: "/citizen",
  VERIFIER: "/citizen",
  VOLUNTEER: "/citizen",
  NGO: "/ngo",
  AGENCY: "/agency",
  DS_OFFICER: "/ds-officer",
  ADMIN: "/admin",
};

// ─── Route-to-allowed-roles map ───────────────────────────────────────────
// Ordered: most-specific first. First match wins.
const ROLE_ROUTES: Array<{ prefix: string; allowed: string[] }> = [
  { prefix: "/admin",      allowed: ["ADMIN"] },
  { prefix: "/ds-officer", allowed: ["DS_OFFICER", "ADMIN"] },
  { prefix: "/agency",     allowed: ["AGENCY", "ADMIN"] },
  { prefix: "/ngo",        allowed: ["NGO", "ADMIN"] },
  // /citizen is accessible to all authenticated + onboarded roles
  { prefix: "/citizen",    allowed: ["CITIZEN", "VERIFIER", "VOLUNTEER", "NGO", "AGENCY", "DS_OFFICER", "ADMIN"] },
>>>>>>> 7548f6d (Update CivicPulse development features)
];

// ─── Public routes (no auth required) ─────────────────────────────────────
const PUBLIC_PREFIXES = [
  "/",          // landing page (exact)
  "/sign-in",
  "/sign-up",
  "/dashboard", // public transparency dashboard
  "/api/webhooks",
  "/api/dashboard",
];

// ─── Onboarding-exempt (reachable before onboarding completes) ─────────────
const ONBOARDING_EXEMPT_PREFIXES = [
  "/onboarding",
  "/callback",
  "/api/onboarding",
  "/api/webhooks",
  "/sign-out",
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) =>
    p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p + "/")
  );
}

function isOnboardingExempt(pathname: string): boolean {
  return ONBOARDING_EXEMPT_PREFIXES.some((p) =>
    pathname === p || pathname.startsWith(p + "/")
  );
}

function getRoleFromClaims(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionClaims: Record<string, any> | null | undefined
): string | null {
  if (!sessionClaims) return null;
  return (
    sessionClaims?.publicMetadata?.role ??
    sessionClaims?.metadata?.role ??
    null
  );
}

function matchRoleRoute(
  pathname: string
): { prefix: string; allowed: string[] } | null {
  return (
    ROLE_ROUTES.find(
      (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/")
    ) ?? null
  );
}

// ─── Middleware ────────────────────────────────────────────────────────────
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // 1. Public routes — always pass through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Protect: require authentication
  const { userId, sessionClaims } = await auth.protect({
    // Unauthenticated → redirect to sign-in, preserving the intended destination
    unauthenticatedUrl: new URL(
      `/sign-in?redirect_url=${encodeURIComponent(pathname)}`,
      req.url
    ).toString(),
  });

  // 3. Onboarding gate: if not yet complete, force /onboarding
  //    (skip for the onboarding page itself and its API calls)
  if (userId && !isOnboardingExempt(pathname)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const claims = sessionClaims as any;
    const onboardingComplete =
      claims?.publicMetadata?.onboardingComplete === true ||
      claims?.metadata?.onboardingComplete === true;

    if (!onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // 4. Role-based route protection
  const roleRoute = matchRoleRoute(pathname);
  if (roleRoute && userId) {
    const role = getRoleFromClaims(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sessionClaims as Record<string, any> | null
    );

    if (!role || !roleRoute.allowed.includes(role)) {
      // Send to their own dashboard root — don't 403, redirect usefully
      const dashboardPath = role
        ? (ROLE_DASHBOARD[role] ?? "/citizen")
        : "/citizen";
      return NextResponse.redirect(new URL(dashboardPath, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files unless in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
