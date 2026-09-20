import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuditLogs } from "@/lib/tracking/audit-log";
import { db } from "@/lib/db";

/**
 * GET /api/audit
 * Fetch audit logs with optional filters
 * Query params: actorId, targetType, action, targetId, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from DB to check role
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const actorId = url.searchParams.get("actorId") || undefined;
    const targetType = url.searchParams.get("targetType") || undefined;
    const action = url.searchParams.get("action") || undefined;
    const targetId = url.searchParams.get("targetId") || undefined;
    const limit = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit")!)
      : 50;

    const logs = await getAuditLogs({
      actorId,
      targetType,
      action,
      targetId,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("[AUDIT API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
