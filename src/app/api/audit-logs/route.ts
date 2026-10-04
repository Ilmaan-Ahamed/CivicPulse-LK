import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";

async function getAuditLogs(req: Request) {
  const { userId } = await requireRole(["ADMIN"] as any);

  const logs = await db.auditLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    data: logs.map((log) => ({
      id: log.id,
      user: log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.role})` : "System",
      action: log.action,
      entity: `${log.entity} #${log.entityId}`,
      ip: log.ipAddress,
      time: log.createdAt.toLocaleString(),
    })),
  });
}

export const GET = getAuditLogs;
