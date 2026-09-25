import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { tryGetPresignedUrl } from "@/lib/minio";

async function getDashboardReports(req: Request) {
  const { userId, role } = await requireRole(["CITIZEN", "NGO_PARTNER", "DS_OFFICER", "ADMIN"] as any);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const where: any = {};
  if (status) {
    where.status = status;
  }

  // Role-based filtering
  if (role === "CITIZEN") {
    // Citizens see their own reports
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (user) {
      where.citizenId = user.id;
    }
  }
  // ADMIN sees all reports (no filtering)
  // NGO_PARTNER and DS_OFFICER also see all reports

  const reports = await db.report.findMany({
    where,
    include: {
      photos: {
        orderBy: { createdAt: "asc" },
      },
      verifications: {
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: await Promise.all(reports.map(async (report) => {
      const photos = await Promise.all(report.photos.map(async (photo) => ({
        id: photo.id,
        caption: photo.caption,
        url: await tryGetPresignedUrl(photo.key),
      })));

      return {
      id: report.id,
      caseNumber: report.referenceNo,
      title: report.title,
      description: report.description,
      category: report.category,
      status: report.status,
      priorityScore: report.aiConfidence || 50,
      address: report.address,
      district: report.district,
      latitude: report.latitude,
      longitude: report.longitude,
      imageUrl: photos[0]?.url ?? null,
      photos,
      verificationCount: report.verifications.length,
      verificationThreshold: 3,
      createdAt: report.createdAt.toISOString(),
      };
    })),
  });
}

export const GET = getDashboardReports;
