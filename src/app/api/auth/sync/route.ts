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
    if (!authUserId) {
      return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    }

    let user = await db.user.findUnique({
      where: { clerkId: authUserId },
    });

    if (!user) {
      let email = typeof body.email === "string" ? body.email : undefined;
      let firstName = typeof body.firstName === "string" ? body.firstName : null;
      let lastName = typeof body.lastName === "string" ? body.lastName : null;
      let avatarUrl = typeof body.imageUrl === "string" ? body.imageUrl : null;
      let clerkMetadataRole: SignupRole | undefined;

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

      if (!email) {
        return NextResponse.json({ success: false, error: "No email provided for user sync" }, { status: 400 });
      }

      const existingByEmail = await db.user.findUnique({
        where: { email },
      });

      if (existingByEmail) {
        user = await db.user.update({
          where: { id: existingByEmail.id },
          data: {
            clerkId: authUserId,
            firstName: firstName || existingByEmail.firstName,
            lastName: lastName || existingByEmail.lastName,
            avatarUrl: avatarUrl || existingByEmail.avatarUrl,
          },
        });
      } else {
        const signupRole = clerkMetadataRole ?? "CITIZEN";

        user = await db.user.create({
          data: {
            clerkId: authUserId,
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
