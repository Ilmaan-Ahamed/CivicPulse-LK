import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { InspectionResult, ReportStatus, AssignmentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";

const createInspectionSchema = z.object({
  assignmentId: z.string().cuid(),
  findings: z.string().trim().min(1).max(5000),
  result: z.nativeEnum(InspectionResult),
  latitude: z.number().finite(),
  longitude: z.number().finite(),
  photoUrls: z.array(z.string().url()).optional(),
});

async function createInspection(req: Request) {
  const { userId } = await requireRole(["NGO_PARTNER", "DS_OFFICER", "ADMIN"] as any);
  const body = await req.json();
  
  const parsed = createInspectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid inspection data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { assignmentId, findings, result, latitude, longitude, photoUrls } = parsed.data;

  // Get user ID from clerkId
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  // Check if assignment exists and is in valid state
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: { report: true },
  });

  if (!assignment) {
    return NextResponse.json(
      { success: false, error: "Assignment not found" },
      { status: 404 }
    );
  }

  if (assignment.status !== AssignmentStatus.IN_PROGRESS) {
    return NextResponse.json(
      { success: false, error: "Assignment must be in IN_PROGRESS status to submit inspection" },
      { status: 400 }
    );
  }

  // Determine report status based on inspection result
  let newReportStatus: ReportStatus;
  switch (result) {
    case InspectionResult.CONFIRMED_RESOLVED:
      newReportStatus = ReportStatus.RESOLVED;
      break;
    case InspectionResult.PARTIALLY_RESOLVED:
      newReportStatus = ReportStatus.IN_PROGRESS;
      break;
    case InspectionResult.ESCALATE:
      newReportStatus = ReportStatus.UNDER_VERIFICATION;
      break;
    case InspectionResult.NOT_RESOLVED:
      newReportStatus = ReportStatus.IN_PROGRESS;
      break;
    default:
      newReportStatus = ReportStatus.IN_PROGRESS;
  }

  // Create inspection, update assignment status, update report status, and create audit log in transaction
  const resultData = await db.$transaction(async (tx) => {
    // Create inspection
    const inspection = await tx.fieldInspection.create({
      data: {
        assignmentId,
        inspectorId: user.id,
        findings,
        result,
        latitude,
        longitude,
      },
    });

    // Create photo records if provided
    if (photoUrls && photoUrls.length > 0) {
      await tx.photo.createMany({
        data: photoUrls.map((url) => ({
          url,
          key: url.split("/").pop() || "",
          inspectionId: inspection.id,
        })),
      });
    }

    // Update assignment status to COMPLETED
    const updatedAssignment = await tx.assignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Update report status
    const updatedReport = await tx.report.update({
      where: { id: assignment.reportId },
      data: {
        status: newReportStatus,
        ...(newReportStatus === ReportStatus.RESOLVED && { resolvedAt: new Date() }),
      },
    });

    // Create status history
    await tx.statusHistory.create({
      data: {
        reportId: assignment.reportId,
        fromStatus: assignment.report.status,
        toStatus: newReportStatus,
        changedBy: user.id,
        reason: `Field inspection result: ${result}`,
      },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "INSPECTION_CREATED",
        entity: "FieldInspection",
        entityId: inspection.id,
        targetType: "Assignment",
        targetId: assignmentId,
        metadata: {
          result,
          findings,
          latitude,
          longitude,
          previousAssignmentStatus: assignment.status,
          newAssignmentStatus: AssignmentStatus.COMPLETED,
          previousReportStatus: assignment.report.status,
          newReportStatus: newReportStatus,
        },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });

    return { inspection, updatedAssignment, updatedReport, newReportStatus };
  });

  return NextResponse.json({
    success: true,
    data: {
      inspection: resultData.inspection,
      assignmentStatus: resultData.updatedAssignment.status,
      reportStatus: resultData.newReportStatus,
    },
  }, { status: 201 });
}

async function listInspections(req: Request) {
  const { userId } = await requireRole(["NGO_PARTNER", "DS_OFFICER", "ADMIN"] as any);
  const url = new URL(req.url);
  const assignmentId = url.searchParams.get("assignmentId");
  const inspectorId = url.searchParams.get("inspectorId");
  const result = url.searchParams.get("result");

  const where: any = {};
  if (assignmentId) where.assignmentId = assignmentId;
  if (inspectorId) where.inspectorId = inspectorId;
  if (result) where.result = result;

  const inspections = await db.fieldInspection.findMany({
    where,
    include: {
      assignment: {
        include: {
          report: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
              district: true,
            },
          },
          agency: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      },
      inspector: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      photos: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: inspections,
  });
}

export const POST = withErrorHandler(createInspection);
export const GET = withErrorHandler(listInspections);
