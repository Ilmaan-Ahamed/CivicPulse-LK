import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { userId } = await requireRole(["CITIZEN", "NGO_PARTNER", "DS_OFFICER", "ADMIN"] as any);

    // Get user from clerkId
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, district: true, dsDivision: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get reports that need verification (SUBMITTED or UNDER_VERIFICATION)
    const reports = await db.report.findMany({
      where: {
        status: {
          in: [ReportStatus.SUBMITTED, ReportStatus.UNDER_VERIFICATION],
        },
        citizenId: {
          not: user.id, // Exclude own reports
        },
      },
      select: {
        id: true,
        referenceNo: true,
        title: true,
        description: true,
        category: true,
        status: true,
        priority: true,
        address: true,
        latitude: true,
        longitude: true,
        isDuplicate: true,
        verifyCount: true,
        citizen: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            trustScore: true,
          },
        },
        photos: {
          where: { reportId: { not: null } },
          take: 1,
        },
        verifications: {
          where: { verifierId: user.id },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Filter out reports already verified by this user
    const availableReports = reports.filter(
      (report) => report.verifications.length === 0
    );

    // Calculate verification data for each report
    const queueData = availableReports.map((report) => {
      const verificationCount = report.verifyCount || 0;
      const threshold = 3;
      const currentConfirmations = verificationCount;
      
      // Calculate distance (simplified - in production use PostGIS ST_DWithin)
      const distance = "Nearby"; // Placeholder for actual distance calculation
      
      // Map priority enum to score
      const priorityScoreMap: Record<string, number> = {
        CRITICAL: 90,
        HIGH: 75,
        MEDIUM: 50,
        LOW: 25,
      };
      const priorityScore = report.priority ? priorityScoreMap[report.priority] || 50 : 50;

      return {
        id: report.id,
        caseNumber: report.referenceNo,
        title: report.title,
        description: report.description,
        category: report.category,
        status: report.status,
        priorityScore,
        address: report.address || "Unknown location",
        imageUrl: report.photos[0]?.url || null,
        distance,
        currentConfirmations,
        threshold,
        reporterTrust: Math.round(report.citizen.trustScore),
        aiDuplicateNotice: report.isDuplicate ? "Flagged as potential duplicate" : null,
        latitude: report.latitude,
        longitude: report.longitude,
      };
    });

    return NextResponse.json({
      success: true,
      data: queueData,
    });
  } catch (error) {
    console.error("[VERIFICATION QUEUE ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch verification queue" },
      { status: 500 }
    );
  }
}
