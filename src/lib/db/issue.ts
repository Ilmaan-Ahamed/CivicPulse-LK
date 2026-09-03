import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { Category, ReportStatus } from "@prisma/client";

export type CreateIssueInput = {
  title: string;
  description: string;
  category?: Category | keyof typeof Category | string;
  latitude?: number;
  longitude?: number;
  address?: string;
  status?: ReportStatus | keyof typeof ReportStatus | string;
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
  return await db.report.delete({ where: { id: issueId } });
}

export async function createIssue(data: CreateIssueInput) {
  const { userId } = await requireRole(["CITIZEN", "DS_OFFICER", "ADMIN"]);
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User profile is not synchronized with the database");
  }

  return await db.report.create({
    data: {
      title: data.title,
      description: data.description,
      citizenId: user.id,
      category: toCategory(data.category),
      latitude: data.latitude ?? 6.9271,
      longitude: data.longitude ?? 79.8612,
      address: data.address ?? null,
      status: toReportStatus(data.status),
    },
  });
}

export async function updateIssueStatus(issueId: string, status: ReportStatus | keyof typeof ReportStatus | string) {
  await requireRole(["DS_OFFICER", "ADMIN"]);
  return await db.report.update({
    where: { id: issueId },
    data: { status: toReportStatus(status) },
  });
}