import { NextRequest, NextResponse } from "next/server";
import { AssignmentStatus, ReportStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";
import { Role } from "@/lib/roles";
import { logStatusChange } from "@/lib/tracking/status-history";
import { logAuditAction } from "@/lib/tracking/audit-log";
import { createNotification } from "@/lib/tracking/notifications";

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

    // Log status change
    await tx.statusHistory.create({
      data: {
        reportId,
        fromStatus: report.status,
        toStatus: ReportStatus.ASSIGNED,
        changedBy: userId,
        reason: "Report assigned to agency",
      },
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

  // Notify citizen about assignment
  await createNotification(
    report.citizenId,
    "Report Assigned",
    `Your report "${report.title}" has been assigned to ${agency.name}`,
    "ASSIGNMENT",
    result.assignment.id
  );

  return NextResponse.json({
    success: true,
    data: result.assignment,
  });
}

async function listAssignments(req: Request) {
  const { userId } = await requireRole(["DS_OFFICER", "NGO_PARTNER", "ADMIN"] as any);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const agencyId = url.searchParams.get("agencyId");
  const reportId = url.searchParams.get("reportId");

  const where: any = {};
  if (status) where.status = status;
  if (agencyId) where.agencyId = agencyId;
  if (reportId) where.reportId = reportId;

  const assignments = await db.assignment.findMany({
    where,
    include: {
      report: {
        select: {
          id: true,
          referenceNo: true,
          title: true,
          description: true,
          category: true,
          status: true,
          district: true,
          latitude: true,
          longitude: true,
          address: true,
          createdAt: true,
        },
      },
      agency: {
        select: {
          id: true,
          name: true,
          type: true,
          contactEmail: true,
          contactPhone: true,
          district: true,
        },
      },
      assignedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      inspections: {
        include: {
          inspector: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: assignments,
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
        ...(status === "ACCEPTED" && { acceptedAt: new Date() }),
        ...(status === "COMPLETED" && { completedAt: new Date() }),
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

  // Update report status based on assignment status
  if (status === "IN_PROGRESS" && assignment.report.status === "ASSIGNED") {
    await db.report.update({
      where: { id: assignment.reportId },
      data: { status: ReportStatus.IN_PROGRESS },
    });
    await logStatusChange(assignment.reportId, ReportStatus.IN_PROGRESS, userId, "Assignment in progress");
  }

  if (status === "COMPLETED") {
    await db.report.update({
      where: { id: assignment.reportId },
      data: { status: ReportStatus.FIELD_VERIFIED },
    });
    await logStatusChange(assignment.reportId, ReportStatus.FIELD_VERIFIED, userId, "Assignment completed");
  }

  // Notify DS officer about assignment update
  if (assignment.assignedById) {
    await createNotification(
      assignment.assignedById,
      "Assignment Status Updated",
      `Assignment status changed to ${status}`,
      "ASSIGNMENT_UPDATE",
      id
    );
  }

  return NextResponse.json({
    success: true,
    data: result.updatedAssignment,
  });
}

export const GET = withErrorHandler(listAssignments);
export const POST = withErrorHandler(createAssignment);
export const PATCH = withErrorHandler(updateAssignment);
