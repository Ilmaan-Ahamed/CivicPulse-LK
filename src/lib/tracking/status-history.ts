import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";

/**
 * Log a status change for a report
 * @param reportId - The report ID
 * @param toStatus - The new status
 * @param changedBy - User ID who caused the change (optional)
 * @param reason - Reason for the status change (optional)
 */
export async function logStatusChange(
  reportId: string,
  toStatus: ReportStatus,
  changedBy?: string,
  reason?: string
) {
  try {
    // Get current status
    const report = await db.report.findUnique({
      where: { id: reportId },
      select: { status: true },
    });

    if (!report) {
      console.error("[STATUS HISTORY] Report not found:", reportId);
      return;
    }

    const fromStatus = report.status;

    // Only log if status actually changed
    if (fromStatus === toStatus) {
      return;
    }

    await db.statusHistory.create({
      data: {
        reportId,
        fromStatus,
        toStatus,
        changedBy,
        reason,
      },
    });

    console.info("[STATUS HISTORY] Logged", {
      reportId,
      fromStatus,
      toStatus,
      changedBy,
    });
  } catch (error) {
    console.error("[STATUS HISTORY] Error logging status change:", error);
  }
}

/**
 * Get status history for a report
 * @param reportId - The report ID
 */
export async function getStatusHistory(reportId: string) {
  try {
    const history = await db.statusHistory.findMany({
      where: { reportId },
      orderBy: { createdAt: "desc" },
      include: {
        report: {
          select: {
            referenceNo: true,
            title: true,
          },
        },
      },
    });

    return history;
  } catch (error) {
    console.error("[STATUS HISTORY] Error fetching history:", error);
    return [];
  }
}
