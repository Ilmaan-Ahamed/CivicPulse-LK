import { db } from "@/lib/db";
import { headers } from "next/headers";

/**
 * Log an audit action
 * @param action - The action performed (e.g., ASSIGNMENT_CREATED, REPORT_STATUS_UPDATED)
 * @param targetType - The type of entity affected (e.g., Report, Assignment, Agency)
 * @param targetId - The ID of the entity affected
 * @param actorId - The user ID who performed the action
 * @param metadata - Additional context (before/after values, etc.)
 */
export async function logAuditAction(
  action: string,
  targetType?: string,
  targetId?: string,
  actorId?: string,
  metadata?: any
) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || 
                     headersList.get("x-real-ip") || 
                     "unknown";

    await db.auditLog.create({
      data: {
        action,
        targetType,
        targetId,
        actorId,
        metadata,
        ipAddress,
      },
    });

    console.info("[AUDIT LOG] Logged", {
      action,
      targetType,
      targetId,
      actorId,
    });
  } catch (error) {
    console.error("[AUDIT LOG] Error logging action:", error);
  }
}

/**
 * Get audit logs with filters
 * @param filters - Optional filters (actorId, targetType, action, limit)
 */
export async function getAuditLogs(filters?: {
  actorId?: string;
  targetType?: string;
  action?: string;
  targetId?: string;
  limit?: number;
}) {
  try {
    const { actorId, targetType, action, targetId, limit = 50 } = filters || {};

    const where: any = {};
    if (actorId) where.actorId = actorId;
    if (targetType) where.targetType = targetType;
    if (action) where.action = action;
    if (targetId) where.targetId = targetId;

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return logs;
  } catch (error) {
    console.error("[AUDIT LOG] Error fetching logs:", error);
    return [];
  }
}
