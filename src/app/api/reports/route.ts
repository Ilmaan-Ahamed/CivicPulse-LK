import { NextResponse } from "next/server";
import { z } from "zod";
import { createIssue } from "@/lib/db/issue";
import { db } from "@/lib/db";
import { Prisma, ReportStatus } from "@prisma/client";

const createReportSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  category: z.string().optional(),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
  address: z.string().trim().max(500).optional(),
  photos: z.array(z.object({
    secure_url: z.string().url().max(2000),
    public_id: z.string().min(1).max(300),
  })).max(5).optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");

    const status = statusParam
      ? Object.values(ReportStatus).find((reportStatus) => reportStatus === statusParam)
      : undefined;
    if (statusParam && !status) {
      return NextResponse.json({ success: false, error: "Invalid report status" }, { status: 400 });
    }
    const where: Prisma.ReportWhereInput = { status };

    const reports = await db.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        referenceNo: true,
        title: true,
        description: true,
        summary: true,
        category: true,
        status: true,
        district: true,
        address: true,
        createdAt: true,
        aiConfidence: true,
      },
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
        district: report.district,
        address: report.address,
        priorityScore: report.aiConfidence || 50,
        createdAt: report.createdAt,
      })),
    });
  } catch (error) {
    console.error("[REPORT GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const parsed = createReportSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid report data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { photos, ...reportData } = parsed.data;
    const report = await createIssue({
      ...reportData,
      photos: photos?.map(({ secure_url, public_id }) => ({ url: secure_url, publicId: public_id })),
    });
    console.info("[REPORT CREATED]", {
      id: report.id,
      referenceNo: report.referenceNo,
      citizenId: report.citizenId,
    });

    return NextResponse.json(
      {
        success: true,
        report: {
          id: report.id,
          caseNumber: report.referenceNo,
          title: report.title,
          description: report.description,
          category: report.category,
          status: report.status,
          latitude: report.latitude,
          longitude: report.longitude,
          address: report.address,
          createdAt: report.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REPORT CREATE ERROR]", error);
    const message = error instanceof Error ? error.message : "Unable to create report";
    const status = message.startsWith("Unauthorized")
      ? 401
      : message.startsWith("Forbidden")
        ? 403
        : message === "Invalid report photo reference"
          ? 400
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
