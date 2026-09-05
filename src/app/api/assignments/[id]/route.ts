import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";

async function getAssignmentById(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await requireRole(["DS_OFFICER", "NGO_PARTNER", "ADMIN"] as any);
  
  const assignment = await db.assignment.findUnique({
    where: { id: params.id },
    include: {
      report: {
        select: {
          id: true,
          title: true,
          description: true,
          summary: true,
          category: true,
          status: true,
          district: true,
          latitude: true,
          longitude: true,
          address: true,
          aiConfidence: true,
          createdAt: true,
        },
      },
      agency: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  if (!assignment) {
    return NextResponse.json(
      { success: false, error: "Assignment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: assignment,
  });
}

export const GET = withErrorHandler(getAssignmentById);
