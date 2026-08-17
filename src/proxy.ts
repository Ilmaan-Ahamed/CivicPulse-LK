import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ROUTE_ACCESS, normalizeRole } from "@/lib/roles";

const isProtectedRoute = (path: string) => path.startsWith("/dashboard");

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  if (!isProtectedRoute(path)) return;

  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const roleClaim =
    (sessionClaims as any)?.metadata?.role ??
    (sessionClaims as any)?.role ??
    (sessionClaims as any)?.publicMetadata?.role ??
    (sessionClaims as any)?.userRole;
  const role = normalizeRole(roleClaim);

  const matchedPrefix = Object.keys(ROUTE_ACCESS).find((prefix) =>
    path.startsWith(prefix)
  );

  if (matchedPrefix && role && !ROUTE_ACCESS[matchedPrefix].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};