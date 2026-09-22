import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ReportStatus, Category } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";

const updateReportSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  category: z.nativeEnum(Category).optional(),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
  address: z.string().trim().max(500).optional(),
  status: z.nativeEnum(ReportStatus).optional(),
});

async function getReportById(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId, role } = await requireRole(["CITIZEN", "NGO_PARTNER", "DS_OFFICER", "ADMIN"] as any);
  const { id } = await params;
  
  const report = await db.report.findUnique({
    where: { id },
    include: {
      citizen: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          trustScore: true,
        },
      },
      photos: {
        orderBy: { createdAt: "asc" },
      },
      verifications: {
        include: {
          verifier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              trustScore: true,
            },
          },
          photos: true,
        },
        orderBy: { createdAt: "desc" },
      },
      assignments: {
        include: {
          agency: {
            select: {
              id: true,
              name: true,
              type: true,
              contactEmail: true,
              contactPhone: true,
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
              photos: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      statusHistory: {
        include: {
          report: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!report) {
    return NextResponse.json(
      { success: false, error: "Report not found" },
      { status: 404 }
    );
  }

  // Role-based access control
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (role === "CITIZEN" && user && report.citizenId !== user.id) {
    return NextResponse.json(
      { success: false, error: "You can only view your own reports" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    data: report,
  });
}

async function updateReport(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId, role } = await requireRole(["CITIZEN", "DS_OFFICER", "ADMIN"] as any);
  const body = await req.json();
  const { id } = await params;
  
  const parsed = updateReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid report data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Check if report exists
  const report = await db.report.findUnique({
    where: { id },
  });

  if (!report) {
    return NextResponse.json(
      { success: false, error: "Report not found" },
      { status: 404 }
    );
  }

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

  // Role-based access control
  if (role === "CITIZEN" && report.citizenId !== user.id) {
    return NextResponse.json(
      { success: false, error: "You can only update your own reports" },
      { status: 403 }
    );
  }

  // Citizens can only update certain fields
  if (role === "CITIZEN") {
    const allowedFields = ["title", "description", "category", "latitude", "longitude", "address"];
    const requestedFields = Object.keys(parsed.data);
    const invalidFields = requestedFields.filter((field) => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Citizens cannot update: ${invalidFields.join(", ")}` },
        { status: 403 }
      );
    }

    // Citizens cannot update status
    if (parsed.data.status !== undefined) {
      return NextResponse.json(
        { success: false, error: "Citizens cannot update report status" },
        { status: 403 }
      );
    }
  }

  // If status is being changed, create status history
  const { status, ...otherData } = parsed.data;
  let statusHistoryCreated = false;

  const result = await db.$transaction(async (tx) => {
    const updatedReport = await tx.report.update({
      where: { id },
      data: {
        ...otherData,
        ...(status && { status }),
      },
    });

    // Create status history if status changed
    if (status && status !== report.status) {
      await tx.statusHistory.create({
        data: {
          reportId: id,
          fromStatus: report.status,
          toStatus: status,
          changedBy: user.id,
          reason: "Manual status update",
        },
      });
      statusHistoryCreated = true;
    }

    // Create audit log
    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "REPORT_UPDATED",
        entity: "Report",
        entityId: id,
        metadata: {
          previous: {
            title: report.title,
            description: report.description,
            category: report.category,
            status: report.status,
          },
          new: {
            title: updatedReport.title,
            description: updatedReport.description,
            category: updatedReport.category,
            status: updatedReport.status,
          },
          statusChanged: statusHistoryCreated,
        },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });

    return { updatedReport };
  });

  return NextResponse.json({
    success: true,
    data: result.updatedReport,
  });
}

async function deleteReport(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId, role } = await requireRole(["CITIZEN", "ADMIN"] as any);
  const { id } = await params;
  
  // Check if report exists
  const report = await db.report.findUnique({
    where: { id },
  });

  if (!report) {
    return NextResponse.json(
      { success: false, error: "Report not found" },
      { status: 404 }
    );
  }

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

  // Role-based access control
  if (role === "CITIZEN" && report.citizenId !== user.id) {
    return NextResponse.json(
      { success: false, error: "You can only delete your own reports" },
      { status: 403 }
    );
  }

  // Citizens can only delete reports in certain statuses
  if (role === "CITIZEN") {
    const deletableStatuses: ReportStatus[] = [ReportStatus.SUBMITTED, ReportStatus.UNDER_VERIFICATION];
    if (!deletableStatuses.includes(report.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot delete report with status: ${report.status}. Only reports in SUBMITTED or UNDER_VERIFICATION can be deleted.` },
        { status: 403 }
      );
    }
  }

  // Delete report and create audit log in transaction
  await db.$transaction(async (tx) => {
    await tx.report.delete({
      where: { id },
    });

    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "REPORT_DELETED",
        entity: "Report",
        entityId: id,
        metadata: {
          title: report.title,
          category: report.category,
          status: report.status,
          citizenId: report.citizenId,
          deletedBy: role,
        },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: "Report deleted successfully",
  });
}

export const GET = withErrorHandler(getReportById);
export const PATCH = withErrorHandler(updateReport);
export const DELETE = withErrorHandler(deleteReport);
