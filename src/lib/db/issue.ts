import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { Category, ReportStatus } from "@prisma/client";
import { logStatusChange } from "@/lib/tracking/status-history";
import { logAuditAction } from "@/lib/tracking/audit-log";
import { findDuplicateReports, markAsDuplicate } from "@/lib/tracking/duplicate-detection";
import { createNotification } from "@/lib/tracking/notifications";

export type CreateIssueInput = {
  title: string;
  description: string;
  category?: Category | keyof typeof Category | string;
  latitude?: number;
  longitude?: number;
  address?: string;
  status?: ReportStatus | keyof typeof ReportStatus | string;
  photoKeys?: string[];
};

function toCategory(value?: CreateIssueInput["category"]): Category {
  if (!value) return Category.OTHER;
  if (typeof value === "string") {
    const normalized = value.toUpperCase();
    const aliases: Record<string, Category> = {
      ROADS: Category.ROAD_DAMAGE,
      ROAD: Category.ROAD_DAMAGE,
      STREETLIGHTS: Category.STREETLIGHT,
      WATER: Category.WATER_SUPPLY,
    };
    return aliases[normalized] ?? (Category as Record<string, Category>)[normalized] ?? Category.OTHER;
  }
  return value;
}

function toReportStatus(value?: CreateIssueInput["status"]): ReportStatus {
  if (!value) return ReportStatus.SUBMITTED;
  if (typeof value === "string") {
    const normalized = value.toUpperCase();
    return (ReportStatus as Record<string, ReportStatus>)[normalized] ?? ReportStatus.SUBMITTED;
  }
  return value;
}

export async function deleteIssue(issueId: string) {
  await requireRole(["ADMIN"]);
  const report = await db.report.delete({ where: { id: issueId } });
  
  // Log audit action
  await logAuditAction("REPORT_DELETED", "Report", issueId);
  
  return report;
}

export async function createIssue(data: CreateIssueInput) {
  const { userId } = await requireRole(["CITIZEN", "DS_OFFICER", "ADMIN"]);
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!user) {
    throw new Error("User profile is not synchronized with the database");
  }

  const photoKeys = data.photoKeys ?? [];
  const photoKeyPrefix = `reports/${user.id}/`;
  if (
    photoKeys.length > 5 ||
    new Set(photoKeys).size !== photoKeys.length ||
    photoKeys.some((key) =>
      !key.startsWith(photoKeyPrefix) ||
      !/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key.slice(photoKeyPrefix.length))
    )
  ) {
    throw new Error("Invalid report photo reference");
  }

  const category = toCategory(data.category);
  const status = toReportStatus(data.status);
  const lat = data.latitude ?? 6.9271;
  const lng = data.longitude ?? 79.8612;

  // Check for duplicate reports
  const duplicates = await findDuplicateReports(lat, lng, category);
  let duplicateOfId: string | undefined;
  
  if (duplicates.length > 0) {
    // Flag as duplicate of the nearest report
    duplicateOfId = duplicates[0].id;
  }

  const report = await db.report.create({
    data: {
      title: data.title,
      description: data.description,
      citizenId: user.id,
      category,
      latitude: lat,
      longitude: lng,
      address: data.address ?? null,
      status,
      duplicateOfId,
      isDuplicate: !!duplicateOfId,
      photos: {
        create: photoKeys.map((key) => ({ key, url: key })),
      },
    },
  });

  // Log initial status
  await logStatusChange(report.id, status, user.id, "Report created");

  // Log audit action
  await logAuditAction(
    "REPORT_CREATED",
    "Report",
    report.id,
    user.id,
    {
      title: data.title,
      category,
      status,
      isDuplicate: !!duplicateOfId,
    }
  );

  // Create notification for the user about report submission
  await createNotification(
    user.id,
    "Report Submitted Successfully",
    `Your report "${data.title}" has been submitted and is now visible in the system.`,
    "REPORT_SUBMITTED",
    report.id
  );

  // If flagged as duplicate, mark it
  if (duplicateOfId) {
    await markAsDuplicate(report.id, duplicateOfId);
  }

  return report;
}

export async function updateIssueStatus(
  issueId: string,
  status: ReportStatus | keyof typeof ReportStatus | string,
  reason?: string
) {
  const { userId } = await requireRole(["DS_OFFICER", "ADMIN"]);
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User profile is not synchronized with the database");
  }

  const newStatus = toReportStatus(status);

  // Get current report
  const report = await db.report.findUnique({
    where: { id: issueId },
    select: { status: true, citizenId: true },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  // Update status
  const updated = await db.report.update({
    where: { id: issueId },
    data: { status: newStatus },
  });

  // Log status change
  await logStatusChange(issueId, newStatus, user.id, reason);

  // Log audit action
  await logAuditAction(
    "REPORT_STATUS_UPDATED",
    "Report",
    issueId,
    user.id,
    {
      fromStatus: report.status,
      toStatus: newStatus,
      reason,
    }
  );

  // Notify citizen about status change
  await createNotification(
    report.citizenId,
    `Report Status Updated`,
    `Your report "${updated.title}" status changed to ${newStatus}`,
    "REPORT_UPDATE",
    issueId
  );

  // If resolved, set resolvedAt
  if (newStatus === "RESOLVED") {
    await db.report.update({
      where: { id: issueId },
      data: { resolvedAt: new Date() },
    });
  }

  return updated;
}