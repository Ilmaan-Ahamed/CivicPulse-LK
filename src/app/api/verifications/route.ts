import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createVerificationSchema } from "@/lib/validators";
import { calculateNewTrustScore, checkVerificationThreshold } from "@/lib/trust-score";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = createVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { reportId, status, comment, latitude, longitude } = parsed.data;

    // 1. Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { verifications: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // 2. Prevent author from verifying their own report
    if (report.citizenId === user.id) {
      return NextResponse.json(
        { error: "You cannot verify your own reported issue." },
        { status: 400 }
      );
    }

    // 3. Upsert verification record
    const verification = await prisma.verification.upsert({
      where: {
        reportId_verifierId: {
          reportId,
          verifierId: user.id,
        },
      },
      update: { status, comment, latitude, longitude },
      create: {
        reportId,
        verifierId: user.id,
        status,
        comment,
        latitude,
        longitude,
      },
    });

    // 4. Update Report Verification Counts & Check Threshold
    const allVerifications = await prisma.verification.findMany({
      where: { reportId },
      include: { verifier: true },
    });

    const confirmations = allVerifications
      .filter((v) => v.status === "CONFIRMED")
      .map((v) => v.verifier.trustScore);

    const disputes = allVerifications
      .filter((v) => v.status === "DISPUTED")
      .map((v) => v.verifier.trustScore);

    const check = checkVerificationThreshold(confirmations, disputes, 3.0);

    let newReportStatus = report.status;
    if (check.isVerified && report.status === "SUBMITTED") {
      newReportStatus = "VERIFIED";
    } else if (check.isRejected && report.status === "SUBMITTED") {
      newReportStatus = "REJECTED";
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        verifyCount: confirmations.length,
        disputeCount: disputes.length,
        status: newReportStatus,
      },
    });

    // 5. Update Verifier Trust Score (+5 for accurate submission)
    const newTrustScore = calculateNewTrustScore({
      currentScore: user.trustScore,
      verificationAccurate: status === "CONFIRMED",
      consecutiveAccurate: 1,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { trustScore: newTrustScore },
    });

    return NextResponse.json({
      success: true,
      verification,
      newReportStatus,
      newTrustScore,
    });
  } catch (error: unknown) {
    console.error("POST /api/verifications error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit verification";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
