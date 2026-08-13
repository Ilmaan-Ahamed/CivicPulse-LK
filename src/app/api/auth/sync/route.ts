import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    console.log("SYNC Auth Debug:", { userId });

    if (!userId) {
      return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    }

    // Optional body: { role: "CITIZEN" } — only used on first-time sync (registration)
    let requestedRole: Role | undefined;
    try {
      const body = await request.json();
      requestedRole = body?.role;
    } catch {
      // no body sent (e.g. plain login sync) — that's fine
    }

    let user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json({ success: false, error: "Clerk user not found" }, { status: 404 });
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        return NextResponse.json({ success: false, error: "No email on Clerk account" }, { status: 400 });
      }

      user = await db.user.create({
        data: {
          clerkId: userId,
          email,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          avatarUrl: clerkUser.imageUrl || null,
          role: requestedRole || "CITIZEN",
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        email: user.email,
        role: user.role,
        trustScore: user.trustScore,
        dsDivisionCode: user.dsDivision || "",
        dsDivisionName: user.dsDivision || "",
        preferredLanguage: user.preferredLang,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}