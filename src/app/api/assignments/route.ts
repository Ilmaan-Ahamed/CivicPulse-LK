import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createAssignmentSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = createAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { reportId, assignedToId, notes, deadline } = parsed.data;

    // 1. Create Assignment
    const assignment = await prisma.assignment.create({
      data: {
        reportId,
        dsOfficerId: user.id,
        assignedToId,
        notes,
        deadline: deadline ? new Date(deadline) : undefined,
        status: "PENDING",
      },
    });

    // 2. Update Report Status to ASSIGNED
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "ASSIGNED" },
    });

    // 3. Log Audit Entry
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ASSIGN_REPORT",
        entity: "Assignment",
        entityId: assignment.id,
        metadata: { reportId, assignedToId },
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: unknown) {
    console.error("POST /api/assignments error:", error);
    const message = error instanceof Error ? error.message : "Failed to create assignment";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
