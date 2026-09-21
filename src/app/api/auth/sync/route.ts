import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";
import { isSignupRole, normalizeRole, type SignupRole } from "@/lib/roles";

function parseSignupRole(value: unknown): SignupRole | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = normalizeRole(value);
  return isSignupRole(normalized) ? normalized : undefined;
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      // Body may be empty
    }

    const { userId: authUserId } = await auth();
    const effectiveClerkId = authUserId || (body.clerkId as string | undefined);
    console.log("SYNC Auth Debug:", {
      authUserId,
      bodyClerkId: body.clerkId,
      effectiveClerkId,
    });

    if (!effectiveClerkId) {
      return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    }

    const requestedRole = parseSignupRole(body.role);

    let user = await db.user.findUnique({
      where: { clerkId: effectiveClerkId },
    });

    if (!user) {
      let email = typeof body.email === "string" ? body.email : undefined;
      let firstName = typeof body.firstName === "string" ? body.firstName : null;
      let lastName = typeof body.lastName === "string" ? body.lastName : null;
      let avatarUrl = typeof body.imageUrl === "string" ? body.imageUrl : null;
      let clerkMetadataRole: SignupRole | undefined;

      if (authUserId) {
        const clerkUser = await currentUser();
        if (clerkUser) {
          if (!email) email = clerkUser.emailAddresses[0]?.emailAddress;
          firstName = clerkUser.firstName || firstName;
          lastName = clerkUser.lastName || lastName;
          avatarUrl = clerkUser.imageUrl || avatarUrl;
          clerkMetadataRole = parseSignupRole(
            clerkUser.unsafeMetadata?.role ?? clerkUser.publicMetadata?.role
          );
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
          },
        });
      } else {
        const signupRole = requestedRole || clerkMetadataRole;
        if (!signupRole) {
          return NextResponse.json(
            { success: false, error: "A role is required to create an account" },
            { status: 400 }
          );
        }

        user = await db.user.create({
          data: {
            clerkId: effectiveClerkId,
            email,
            firstName,
            lastName,
            avatarUrl,
            role: signupRole as Role,
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