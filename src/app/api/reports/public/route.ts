import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function getPublicReports(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "3");

  const reports = await db.report.findMany({
    take: limit,
    include: {
      photos: {
        take: 1,
      },
      verifications: {
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: reports.map((report) => ({
      id: report.id,
      caseNumber: report.referenceNo,
      title: report.title,
      description: report.description,
      category: report.category,
      status: report.status,
      priorityScore: report.aiConfidence || 50,
      address: report.address,
      dsDivisionName: report.district,
      imageUrl: report.photos[0]?.url || null,
      verificationCount: report.verifications.length,
      verificationThreshold: 3,
      createdAt: report.createdAt.toISOString(),
    })),
  });
}

export const GET = getPublicReports;
