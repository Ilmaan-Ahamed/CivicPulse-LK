import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        citizen: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            trustScore: true,
          },
        },
        photos: true,
        verifications: {
          include: {
            verifier: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                trustScore: true,
              },
            },
            photos: true,
          },
        },
        assignments: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
            inspections: {
              include: {
                photos: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error: unknown) {
    console.error("GET /api/reports/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch report";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
