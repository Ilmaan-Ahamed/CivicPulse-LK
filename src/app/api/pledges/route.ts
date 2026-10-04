import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";

const createPledgeSchema = z.object({
  reportId: z.string(),
  pledgeType: z.enum(["VOLUNTEERS", "FUNDING", "MATERIALS", "TECHNICAL_SUPPORT"]),
  description: z.string().trim().min(1).max(1000),
  amountLkr: z.number().optional(),
});

async function createPledge(req: Request) {
  const { userId, role } = await requireRole(["NGO_PARTNER", "ADMIN"] as any);
  const body = await req.json();
  
  const parsed = createPledgeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid pledge data", details: parsed.error.flatten() },
      { status: 400 }
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

  // Check if report exists
  const report = await db.report.findUnique({
    where: { id: parsed.data.reportId },
  });

  if (!report) {
    return NextResponse.json(
      { success: false, error: "Report not found" },
      { status: 404 }
    );
  }

  // Create pledge
  const pledge = await db.pledge.create({
    data: {
      reportId: parsed.data.reportId,
      ngoId: user.id,
      pledgeType: parsed.data.pledgeType,
      description: parsed.data.description,
      amountLkr: parsed.data.amountLkr,
      status: "PLEDGED",
    },
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: "PLEDGE_CREATED",
      entity: "Pledge",
      entityId: pledge.id,
      metadata: {
        reportId: parsed.data.reportId,
        pledgeType: parsed.data.pledgeType,
        amountLkr: parsed.data.amountLkr,
      },
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
    },
  });

  return NextResponse.json({
    success: true,
    data: pledge,
  });
}

async function getPledges(req: Request) {
  const { userId, role } = await requireRole(["NGO_PARTNER", "ADMIN", "DS_OFFICER"] as any);
  
  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");

  const where: any = {};
  if (reportId) {
    where.reportId = reportId;
  }

  // NGO partners see only their pledges
  if (role === "NGO_PARTNER") {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (user) {
      where.ngoId = user.id;
    }
  }

  const pledges = await db.pledge.findMany({
    where,
    include: {
      report: {
        select: {
          id: true,
          referenceNo: true,
          title: true,
          category: true,
          status: true,
        },
      },
      ngo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: pledges,
  });
}

export const POST = withErrorHandler(createPledge);
export const GET = withErrorHandler(getPledges);
