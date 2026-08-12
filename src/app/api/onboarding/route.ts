import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { onboardingSchema } from "@/lib/validators";

const PENDING_ROLES = ["NGO", "AGENCY", "DS_OFFICER"] as const;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { role, preferredLang, dsDivision, phone } = data;

    // Check whether the user already exists in the DB
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found. Please try signing in again." },
        { status: 404 }
      );
    }

    const isPendingRole = (PENDING_ROLES as readonly string[]).includes(role);

    if (isPendingRole) {
      // -----------------------------------------------------------
      // Pending-approval path (NGO / AGENCY / DS_OFFICER)
      // 1. Keep User.role = CITIZEN (active role stays Citizen)
      // 2. Persist profile fields
      // 3. Create a RoleRequest with status = PENDING
      // 4. Mark onboarding complete (so the gate doesn't loop)
      // 5. Sync CITIZEN (not the requested role) to Clerk metadata
      // -----------------------------------------------------------
      const orgData = data as Extract<typeof data, { orgName?: string; justification: string }>;

      await prisma.$transaction([
        prisma.user.update({
          where: { clerkId: userId },
          data: {
            preferredLang: preferredLang as "EN" | "SI" | "TA",
            dsDivision: dsDivision ?? null,
            phone: phone || null,
            onboardingComplete: true,
            // role stays CITIZEN — only updated when Admin approves
          },
        }),
        prisma.roleRequest.create({
          data: {
            userId: existingUser.id,
            requestedRole: role as "NGO" | "AGENCY" | "DS_OFFICER",
            orgName: orgData.orgName ?? null,
            justification: orgData.justification,
            dsDivision: dsDivision ?? null,
            status: "PENDING",
          },
        }),
      ]);

      // Sync active role (CITIZEN) + onboarding flag to Clerk
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "CITIZEN",
          onboardingComplete: true,
          pendingRoleRequest: role, // helpful for UI banners
        },
      });

      return NextResponse.json({
        success: true,
        status: "PENDING",
        activeRole: "CITIZEN",
        requestedRole: role,
        message: `Your ${role.replace("_", " ")} request has been submitted. You will be notified once an admin reviews it.`,
      });
    } else {
      // -----------------------------------------------------------
      // Instant-access path (CITIZEN / "skip")
      // Set role immediately, no RoleRequest needed.
      // -----------------------------------------------------------
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          role: "CITIZEN",
          preferredLang: preferredLang as "EN" | "SI" | "TA",
          dsDivision: dsDivision ?? null,
          phone: phone || null,
          onboardingComplete: true,
        },
      });

      // Sync role + onboarding flag to Clerk
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "CITIZEN",
          onboardingComplete: true,
        },
      });

      return NextResponse.json({
        success: true,
        status: "ACTIVE",
        activeRole: "CITIZEN",
      });
    }
  } catch (error: unknown) {
    console.error("POST /api/onboarding error:", error);
    const message =
      error instanceof Error ? error.message : "Onboarding failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
