import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth-guard";

async function getInspectionById(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await requireRole(["NGO_PARTNER", "DS_OFFICER", "ADMIN"] as any);
  
  const inspection = await db.fieldInspection.findUnique({
    where: { id: params.id },
    include: {
      assignment: {
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
            },
          },
          agency: {
            select: {
              id: true,
              name: true,
              type: true,
              contactEmail: true,
              contactPhone: true,
            },
          },
          assignedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      },
      inspector: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      photos: true,
    },
  });

  if (!inspection) {
    return NextResponse.json(
      { success: false, error: "Inspection not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: inspection,
  });
}

export const GET = withErrorHandler(getInspectionById);
