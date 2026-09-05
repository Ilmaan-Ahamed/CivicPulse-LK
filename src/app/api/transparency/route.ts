import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const reports = await db.report.findMany({
      select: {
        id: true,
        referenceNo: true,
        title: true,
        description: true,
        category: true,
        status: true,
        latitude: true,
        longitude: true,
        address: true,
        district: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const cases = reports.map((report) => ({
      id: report.id,
      caseNumber: report.referenceNo,
      title: report.title,
      description: report.description,
      category: report.category,
      status: report.status,
      latitude: report.latitude,
      longitude: report.longitude,
      address: report.address ?? "Location not provided",
      district: report.district ?? "Unknown DS Division",
      createdAt: report.createdAt.toISOString(),
    }));

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Error fetching transparency data:", error);
    return NextResponse.json({ cases: [] }, { status: 200 });
  }
}
