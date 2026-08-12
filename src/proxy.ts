import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";
import { ROLE_DASHBOARD } from "@/lib/auth";

const ROLE_ROUTES: Array<{ prefix: string; allowed: Role[] }> = [
  { prefix: "/admin", allowed: ["ADMIN"] },
  { prefix: "/agency", allowed: ["AGENCY", "ADMIN"] },
  { prefix: "/ngo", allowed: ["NGO", "ADMIN"] },
  { prefix: "/ds-console", allowed: ["DS_OFFICER", "ADMIN"] },
  { prefix: "/verify", allowed: ["VERIFIER", "VOLUNTEER", "NGO", "AGENCY", "DS_OFFICER", "ADMIN"] },
  { prefix: "/reports", allowed: ["CITIZEN", "VERIFIER", "VOLUNTEER", "NGO", "AGENCY", "DS_OFFICER", "ADMIN"] },
];

// ─── Public routes (no auth required) ─────────────────────────────────────
const PUBLIC_PREFIXES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/dashboard",
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
): Role | null {
  if (!sessionClaims) return null;
  const role =
    (sessionClaims.publicMetadata?.role as Role | undefined) ??
    (sessionClaims.metadata?.role as Role | undefined) ??
    null;

  return role;
}

function matchRoleRoute(pathname: string): { prefix: string; allowed: Role[] } | null {
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
    unauthenticatedUrl: new URL(
      `/sign-in?redirect_url=${encodeURIComponent(pathname)}`,
      req.url
    ).toString(),
  });

  // 3. Onboarding gate: if not yet complete, force /onboarding
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
      const dashboardPath = role ? (ROLE_DASHBOARD[role] ?? "/citizen") : "/citizen";
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
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};