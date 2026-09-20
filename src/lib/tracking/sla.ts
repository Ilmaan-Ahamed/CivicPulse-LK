import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";

/**
 * SLA thresholds in hours
 */
export const SLA_THRESHOLDS = {
  ASSIGNMENT: 24, // Hours from VERIFIED to ASSIGNED
  RESPONSE: 48, // Hours from ASSIGNED to IN_PROGRESS
  RESOLUTION: 168, // Hours from IN_PROGRESS to RESOLVED (7 days)
} as const;

/**
 * Calculate time difference in hours between two dates
 */
function hoursBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Get SLA metrics for a report
 * @param reportId - The report ID
 */
export async function getReportSLA(reportId: string) {
  try {
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: {
        assignments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!report) {
      return null;
    }

    const metrics = {
      assignmentSLA: null as number | null,
      responseSLA: null as number | null,
      resolutionSLA: null as number | null,
      isAssignmentOverdue: false,
      isResponseOverdue: false,
      isResolutionOverdue: false,
      totalResolutionTime: null as number | null,
    };

    const now = new Date();

    // Calculate assignment SLA (VERIFIED → ASSIGNED)
    const verifiedAt = report.statusHistory.find(
      (h) => h.toStatus === "VERIFIED"
    )?.createdAt;

    const assignedAt = report.statusHistory.find(
      (h) => h.toStatus === "ASSIGNED"
    )?.createdAt;

    if (verifiedAt) {
      if (assignedAt) {
        metrics.assignmentSLA = hoursBetween(verifiedAt, assignedAt);
        metrics.isAssignmentOverdue = metrics.assignmentSLA > SLA_THRESHOLDS.ASSIGNMENT;
      } else if (report.status === "VERIFIED") {
        // Still waiting for assignment
        metrics.assignmentSLA = hoursBetween(verifiedAt, now);
        metrics.isAssignmentOverdue = metrics.assignmentSLA > SLA_THRESHOLDS.ASSIGNMENT;
      }
    }

    // Calculate response SLA (ASSIGNED → IN_PROGRESS)
    const inProgressAt = report.statusHistory.find(
      (h) => h.toStatus === "IN_PROGRESS"
    )?.createdAt;

    if (assignedAt) {
      if (inProgressAt) {
        metrics.responseSLA = hoursBetween(assignedAt, inProgressAt);
        metrics.isResponseOverdue = metrics.responseSLA > SLA_THRESHOLDS.RESPONSE;
      } else if (report.status === "ASSIGNED") {
        // Still waiting for response
        metrics.responseSLA = hoursBetween(assignedAt, now);
        metrics.isResponseOverdue = metrics.responseSLA > SLA_THRESHOLDS.RESPONSE;
      }
    }

    // Calculate resolution SLA (IN_PROGRESS → RESOLVED)
    const resolvedAt = report.resolvedAt;

    if (inProgressAt) {
      if (resolvedAt) {
        metrics.resolutionSLA = hoursBetween(inProgressAt, resolvedAt);
        metrics.isResolutionOverdue = metrics.resolutionSLA > SLA_THRESHOLDS.RESOLUTION;
      } else if (report.status === "IN_PROGRESS") {
        // Still waiting for resolution
        metrics.resolutionSLA = hoursBetween(inProgressAt, now);
        metrics.isResolutionOverdue = metrics.resolutionSLA > SLA_THRESHOLDS.RESOLUTION;
      }
    }

    // Total resolution time (SUBMITTED → RESOLVED)
    if (resolvedAt) {
      metrics.totalResolutionTime = hoursBetween(report.createdAt, resolvedAt);
    }

    return metrics;
  } catch (error) {
    console.error("[SLA] Error calculating metrics:", error);
    return null;
  }
}

/**
 * Get SLA summary for multiple reports
 * @param reportIds - Array of report IDs
 */
export async function getBulkSLAMetrics(reportIds: string[]) {
  try {
    const metrics = await Promise.all(
      reportIds.map((id) => getReportSLA(id))
    );

    const summary = {
      totalReports: reportIds.length,

      // Assignment metrics
      assignmentOverdueCount: 0,
      assignmentAvgHours: 0,
      assignmentCompletedCount: 0,

      // Response metrics
      responseOverdueCount: 0,
      responseAvgHours: 0,
      responseCompletedCount: 0,

      // Resolution metrics
      resolutionOverdueCount: 0,
      resolutionAvgHours: 0,
      resolutionCompletedCount: 0,
      totalAvgResolutionTime: 0,
    };

    let assignmentTotal = 0;
    let responseTotal = 0;
    let resolutionTotal = 0;
    let totalResolutionSum = 0;

    metrics.forEach((m) => {
      if (!m) return;

      if (m.assignmentSLA !== null) {
        if (m.isAssignmentOverdue) summary.assignmentOverdueCount++;
        if (m.assignmentSLA > 0) {
          assignmentTotal += m.assignmentSLA;
          summary.assignmentCompletedCount++;
        }
      }

      if (m.responseSLA !== null) {
        if (m.isResponseOverdue) summary.responseOverdueCount++;
        if (m.responseSLA > 0) {
          responseTotal += m.responseSLA;
          summary.responseCompletedCount++;
        }
      }

      if (m.resolutionSLA !== null) {
        if (m.isResolutionOverdue) summary.resolutionOverdueCount++;
        if (m.resolutionSLA > 0) {
          resolutionTotal += m.resolutionSLA;
          summary.resolutionCompletedCount++;
        }
      }

      if (m.totalResolutionTime !== null) {
        totalResolutionSum += m.totalResolutionTime;
      }
    });

    summary.assignmentAvgHours =
      summary.assignmentCompletedCount > 0
        ? assignmentTotal / summary.assignmentCompletedCount
        : 0;

    summary.responseAvgHours =
      summary.responseCompletedCount > 0
        ? responseTotal / summary.responseCompletedCount
        : 0;

    summary.resolutionAvgHours =
      summary.resolutionCompletedCount > 0
        ? resolutionTotal / summary.resolutionCompletedCount
        : 0;

    summary.totalAvgResolutionTime =
      summary.resolutionCompletedCount > 0
        ? totalResolutionSum / summary.resolutionCompletedCount
        : 0;

    return summary;
  } catch (error) {
    console.error("[SLA] Error calculating bulk metrics:", error);
    return null;
  }
}
