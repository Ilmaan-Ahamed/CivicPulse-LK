import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ROUTE_ACCESS, type Role } from "@/lib/roles";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const role = (sessionClaims?.metadata as any)?.role as Role | undefined;
  const path = req.nextUrl.pathname;

  const matchedPrefix = Object.keys(ROUTE_ACCESS).find((prefix) =>
    path.startsWith(prefix)
  );

  if (matchedPrefix && (!role || !ROUTE_ACCESS[matchedPrefix].includes(role))) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};