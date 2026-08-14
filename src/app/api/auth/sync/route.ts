import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty
    }

    const { userId: authUserId } = await auth();
    const effectiveClerkId = authUserId || body?.clerkId;
    console.log("SYNC Auth Debug:", { authUserId, bodyClerkId: body?.clerkId, effectiveClerkId });

    if (!effectiveClerkId) {
      return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    }

    const requestedRole: Role | undefined = body?.role;

    let user = await db.user.findUnique({
      where: { clerkId: effectiveClerkId },
    });

    if (!user) {
      let email = body?.email;
      let firstName = body?.firstName || null;
      let lastName = body?.lastName || null;
      let avatarUrl = body?.imageUrl || null;

      if (!email && authUserId) {
        const clerkUser = await currentUser();
        if (clerkUser) {
          email = clerkUser.emailAddresses[0]?.emailAddress;
          firstName = clerkUser.firstName || firstName;
          lastName = clerkUser.lastName || lastName;
          avatarUrl = clerkUser.imageUrl || avatarUrl;
        }
      }

      if (!email) {
        return NextResponse.json({ success: false, error: "No email provided for user sync" }, { status: 400 });
      }

      // Check if user exists by email (to avoid unique constraint issues)
      const existingByEmail = await db.user.findUnique({
        where: { email },
      });

      if (existingByEmail) {
        user = await db.user.update({
          where: { id: existingByEmail.id },
          data: {
            clerkId: effectiveClerkId,
            firstName: firstName || existingByEmail.firstName,
            lastName: lastName || existingByEmail.lastName,
            avatarUrl: avatarUrl || existingByEmail.avatarUrl,
            role: requestedRole || existingByEmail.role,
          },
        });
      } else {
        user = await db.user.create({
          data: {
            clerkId: effectiveClerkId,
            email,
            firstName,
            lastName,
            avatarUrl,
            role: requestedRole || "CITIZEN",
          },
        });
      }
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