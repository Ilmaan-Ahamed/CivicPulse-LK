import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createReportSchema, reportQuerySchema } from "@/lib/validators";
import { generateReferenceNo } from "@/lib/utils";
import { runFullTriage } from "@/lib/ai/triage";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/reports — List infrastructure reports with filtering
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const parsed = reportQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { page, limit, status, category, district, sortBy, sortOrder } =
      parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (district) where.district = district;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          citizen: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          photos: true,
          verifications: {
            select: {
              id: true,
              status: true,
              verifierId: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/reports error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports — Submit a new infrastructure report
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, description, category, latitude, longitude, address, district } =
      parsed.data;

    const referenceNo = generateReferenceNo();

    // 1. Create Report in DB
    const report = await prisma.report.create({
      data: {
        referenceNo,
        citizenId: user.id,
        category,
        title,
        description,
        latitude,
        longitude,
        address,
        district: district || user.district || "Colombo",
        status: "SUBMITTED",
      },
    });

    // 2. Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_REPORT",
        entity: "Report",
        entityId: report.id,
        metadata: { referenceNo, category },
      },
    });

    // 3. Async trigger Gemini AI Triage (non-blocking)
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      runFullTriage({
        title,
        description,
        category,
        latitude,
        longitude,
        district: district || "Unknown",
      })
        .then(async (triage) => {
          await prisma.report.update({
            where: { id: report.id },
            data: {
              priority: triage.priority?.priority,
              summary: triage.summary?.summary,
              aiConfidence: triage.priority?.confidence,
              isDuplicate: triage.duplicate?.isDuplicate ?? false,
              duplicateOfId: triage.duplicate?.duplicateOfId,
            },
          });
        })
        .catch((err) => {
          console.error("AI Triage Background Error:", err);
        });
    }

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/reports error:", error);
    const message = error instanceof Error ? error.message : "Failed to create report";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
