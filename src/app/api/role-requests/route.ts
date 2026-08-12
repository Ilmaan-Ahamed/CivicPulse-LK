import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// ===========================================
// GET /api/role-requests — List role requests (Admin only)
// ===========================================
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "PENDING";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));

    const [requests, total] = await prisma.$transaction([
      prisma.roleRequest.findMany({
        where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.roleRequest.count({
        where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
      }),
    ]);

    return NextResponse.json({ requests, total, page, limit });
  } catch (error: unknown) {
    console.error("GET /api/role-requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch role requests" },
      { status: 500 }
    );
  }
}

// ===========================================
// PATCH /api/role-requests — Approve or reject a request (Admin only)
// ===========================================
const reviewSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "NEEDS_INFO"]),
  reviewNote: z.string().max(500).optional(),
});

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { requestId, action, reviewNote } = parsed.data;
    const newStatus =
      action === "APPROVE"
        ? "APPROVED"
        : action === "NEEDS_INFO"
        ? "NEEDS_INFO"
        : "REJECTED";

    // Load the role request
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!roleRequest) {
      return NextResponse.json(
        { error: "Role request not found" },
        { status: 404 }
      );
    }

    if (roleRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been reviewed" },
        { status: 409 }
      );
    }

    // Update request + (if approved) update user's active role
    await prisma.$transaction(async (tx) => {
      await tx.roleRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus,
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          reviewNote: reviewNote ?? null,
        },
      });

      if (action === "APPROVE") {
        await tx.user.update({
          where: { id: roleRequest.userId },
          data: { role: roleRequest.requestedRole },
        });

        // Sync approved role to Clerk publicMetadata
        const client = await clerkClient();
        await client.users.updateUserMetadata(roleRequest.user.clerkId, {
          publicMetadata: {
            role: roleRequest.requestedRole,
            onboardingComplete: true,
            pendingRoleRequest: null,
          },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: admin.id,
          action:
            action === "APPROVE"
              ? "APPROVE_ROLE_REQUEST"
              : action === "NEEDS_INFO"
              ? "NEEDS_INFO_ROLE_REQUEST"
              : "REJECT_ROLE_REQUEST",
          entity: "RoleRequest",
          entityId: requestId,
          metadata: {
            requestedRole: roleRequest.requestedRole,
            targetUserId: roleRequest.userId,
            reviewNote: reviewNote ?? null,
          },
        },
      });

      // Notification to the user
      await tx.notification.create({
        data: {
          userId: roleRequest.userId,
          title:
            action === "APPROVE"
              ? `Role Approved: ${roleRequest.requestedRole.replace("_", " ")}`
              : action === "NEEDS_INFO"
              ? "More Information Requested for Your Role Application"
              : "Role Request Rejected",
          message:
            action === "APPROVE"
              ? `Your request for the ${roleRequest.requestedRole.replace("_", " ")} role has been approved. Please sign out and sign back in to activate your new role.`
              : action === "NEEDS_INFO"
              ? `An admin has requested more information about your role application. Note: ${reviewNote ?? "Please contact support."}`
              : `Your request for the ${roleRequest.requestedRole.replace("_", " ")} role was not approved. ${reviewNote ? `Reason: ${reviewNote}` : ""}`,
          type: "ROLE_REQUEST_UPDATE",
          entityId: requestId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      status: newStatus,
      message:
        action === "APPROVE"
          ? `Role ${roleRequest.requestedRole} granted successfully.`
          : "Role request rejected.",
    });
  } catch (error: unknown) {
    console.error("PATCH /api/role-requests error:", error);
    return NextResponse.json(
      { error: "Failed to process role request" },
      { status: 500 }
    );
  }
}
