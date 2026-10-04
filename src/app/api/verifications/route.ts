import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { VerificationStatus, ReportStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";
import { updateTrustScoreAfterVerification } from "@/lib/trust-score";

const createVerificationSchema = z.object({
  reportId: z.string().cuid(),
  status: z.nativeEnum(VerificationStatus),
  comment: z.string().trim().max(1000).optional(),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
  photoUrls: z.array(z.string().url()).optional(),
});

async function createVerification(req: Request) {
  const { userId } = await requireRole(["CITIZEN", "NGO_PARTNER", "DS_OFFICER", "ADMIN"] as any);
  const body = await req.json();
  
  const parsed = createVerificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid verification data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { reportId, status, comment, latitude, longitude, photoUrls } = parsed.data;

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
    where: { id: reportId },
  });

  if (!report) {
    return NextResponse.json(
      { success: false, error: "Report not found" },
      { status: 404 }
    );
  }

  // Check if user already verified this report
  const existingVerification = await db.verification.findUnique({
    where: {
      reportId_verifierId: {
        reportId,
        verifierId: user.id,
      },
    },
  });

  if (existingVerification) {
    return NextResponse.json(
      { success: false, error: "You have already verified this report" },
      { status: 400 }
    );
  }

  // Create verification, update report counts, and update trust score in transaction
  const result = await db.$transaction(async (tx) => {
    // Create verification
    const verification = await tx.verification.create({
      data: {
        reportId,
        verifierId: user.id,
        status,
        comment,
        latitude,
        longitude,
      },
    });

    // Create photo records if provided
    if (photoUrls && photoUrls.length > 0) {
      await tx.photo.createMany({
        data: photoUrls.map((url) => ({
          url,
          key: url.split("/").pop() || "",
          verificationId: verification.id,
        })),
      });
    }

    // Update report verification counts
    const verifyCountIncrement = status === VerificationStatus.CONFIRMED ? 1 : 0;
    const disputeCountIncrement = status === VerificationStatus.DISPUTED ? 1 : 0;

    const updatedReport = await tx.report.update({
      where: { id: reportId },
      data: {
        verifyCount: { increment: verifyCountIncrement },
        disputeCount: { increment: disputeCountIncrement },
      },
    });

    // Escalate to VERIFIED if 3+ confirms
    let reportStatus = updatedReport.status;
    if (updatedReport.verifyCount >= 3 && reportStatus === ReportStatus.SUBMITTED) {
      reportStatus = ReportStatus.VERIFIED;
      await tx.report.update({
        where: { id: reportId },
        data: { status: reportStatus },
      });

      // Create status history
      await tx.statusHistory.create({
        data: {
          reportId,
          fromStatus: ReportStatus.SUBMITTED,
          toStatus: reportStatus,
          changedBy: user.id,
          reason: "Escalated after 3+ community verifications",
        },
      });
    }

    // Update user trust score
    const newTrustScore = await updateTrustScoreAfterVerification(user.id, status);

    // Create audit log
    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "VERIFICATION_CREATED",
        entity: "Verification",
        entityId: verification.id,
        targetType: "Report",
        targetId: reportId,
        metadata: {
          status,
          comment,
          previousVerifyCount: report.verifyCount,
          newVerifyCount: updatedReport.verifyCount,
          previousDisputeCount: report.disputeCount,
          newDisputeCount: updatedReport.disputeCount,
          reportStatusChanged: reportStatus !== report.status,
          newReportStatus: reportStatus,
          trustScore: newTrustScore,
        },
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      },
    });

    return { verification, updatedReport, reportStatus, newTrustScore };
  });

  return NextResponse.json({
    success: true,
    data: {
      verification: result.verification,
      reportStatus: result.reportStatus,
      trustScore: result.newTrustScore,
    },
  }, { status: 201 });
}

async function listVerifications(req: Request) {
  const { userId } = await requireRole(["CITIZEN", "NGO_PARTNER", "DS_OFFICER", "ADMIN"] as any);
  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");
  const verifierId = url.searchParams.get("verifierId");
  const status = url.searchParams.get("status");

  const where: any = {};
  if (reportId) where.reportId = reportId;
  if (verifierId) where.verifierId = verifierId;
  if (status) where.status = status;

  const verifications = await db.verification.findMany({
    where,
    include: {
      report: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          district: true,
        },
      },
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
  });

  return NextResponse.json({
    success: true,
    data: verifications,
  });
}

export const POST = withErrorHandler(createVerification);
export const GET = withErrorHandler(listVerifications);
