import { NextRequest, NextResponse } from "next/server";
import { AssignmentStatus, ReportStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";
import { Role } from "@/lib/roles";

// Allowed status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "DECLINED"],
  ACCEPTED: ["IN_PROGRESS", "DECLINED"],
  IN_PROGRESS: ["COMPLETED", "DECLINED"],
  DECLINED: [],
  COMPLETED: [],
};

async function createAssignment(req: Request) {
  const { userId } = await requireRole(["DS_OFFICER"] as any);
  const body = await req.json();
  const { reportId, agencyId, notes } = body;

  if (!reportId || !agencyId) {
    return NextResponse.json(
      { success: false, error: "reportId and agencyId are required" },
      { status: 400 }
    );
  }

  // Check if report is in VERIFIED status
  const report = await db.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    return NextResponse.json(
      { success: false, error: "Report not found" },
      { status: 404 }
    );
  }

  if (report.status !== ReportStatus.VERIFIED) {
    return NextResponse.json(
      { success: false, error: "Report must be in VERIFIED status to be assigned" },
      { status: 400 }
    );
  }

  // Check if agency exists and is active
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
  });

  if (!agency) {
    return NextResponse.json(
      { success: false, error: "Agency not found" },
      { status: 404 }
    );
  }

  if (!agency.isActive) {
    return NextResponse.json(
      { success: false, error: "Agency is not active" },
      { status: 400 }
    );
  }

  // Create assignment, update report status, and write audit log in a transaction
  const result = await db.$transaction(async (tx) => {
    const assignment = await tx.assignment.create({
      data: {
        reportId,
        agencyId,
        assignedById: userId,
        status: "PENDING" as any,
        notes,
      },
    });

    const updatedReport = await tx.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.ASSIGNED },
    });

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "ASSIGNMENT_CREATED",
        entity: "Assignment",
        entityId: assignment.id,
        metadata: {
          reportId,
          agencyId,
          notes,
          previousReportStatus: report.status,
          newReportStatus: ReportStatus.ASSIGNED,
        },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });

    return { assignment, updatedReport };
  });

  return NextResponse.json({
    success: true,
    data: result.assignment,
  });
}

async function updateAssignment(req: Request) {
  const { userId } = await requireRole(["DS_OFFICER", "NGO_PARTNER"] as any);
  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { success: false, error: "id and status are required" },
      { status: 400 }
    );
  }

  // Get current assignment
  const assignment = await db.assignment.findUnique({
    where: { id },
    include: { report: true },
  });

  if (!assignment) {
    return NextResponse.json(
      { success: false, error: "Assignment not found" },
      { status: 404 }
    );
  }

  // Validate status transition
  const allowedTransitions = STATUS_TRANSITIONS[assignment.status as string] || [];
  if (!allowedTransitions.includes(status as string)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid status transition from ${assignment.status} to ${status}`,
      },
      { status: 400 }
    );
  }

  // Update assignment status and write audit log in a transaction
  const result = await db.$transaction(async (tx) => {
    const updatedAssignment = await tx.assignment.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "ASSIGNMENT_STATUS_UPDATED",
        entity: "Assignment",
        entityId: id,
        metadata: {
          previousStatus: assignment.status,
          newStatus: status,
        },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });

    return { updatedAssignment };
  });

  return NextResponse.json({
    success: true,
    data: result.updatedAssignment,
  });
}

export const POST = withErrorHandler(createAssignment);
export const PATCH = withErrorHandler(updateAssignment);
