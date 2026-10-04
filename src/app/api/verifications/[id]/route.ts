import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";

async function getVerificationById(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await requireRole(["CITIZEN", "NGO_PARTNER", "DS_OFFICER", "ADMIN"] as any);
  
  const verification = await db.verification.findUnique({
    where: { id: params.id },
    include: {
      report: {
        select: {
          id: true,
          referenceNo: true,
          title: true,
          description: true,
          category: true,
          status: true,
          district: true,
          latitude: true,
          longitude: true,
          address: true,
          verifyCount: true,
          disputeCount: true,
          createdAt: true,
        },
      },
      verifier: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          trustScore: true,
        },
      },
      photos: true,
    },
  });

  if (!verification) {
    return NextResponse.json(
      { success: false, error: "Verification not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: verification,
  });
}

export const GET = withErrorHandler(getVerificationById);
