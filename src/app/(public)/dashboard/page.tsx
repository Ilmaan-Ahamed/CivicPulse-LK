import React from "react";
import { redirect } from "next/navigation";
import { Category, ReportStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { requireRole } from "@/lib/auth-guard";
import type {
  DashboardStats,
  StatusCount,
  CategoryCount,
  ResolutionTimelinePoint,
  RecentActivity,
  ReportLocation,
  DivisionCount,
  WeeklyTrendPoint,
} from "@/types/dashboard";

async function getDashboardData(filters: {
  district?: string;
  category?: Category;
  status?: ReportStatus;
  dateFrom?: string;
  dateTo?: string;
}) {
  const where: any = {};
  if (filters.district) where.district = filters.district;
  if (filters.category) where.category = filters.category;
  if (filters.status) where.status = filters.status;
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  const [
    totalReports,
    verifiedCount,
    resolvedCount,
    statusDistribution,
    categoryBreakdown,
    recentActivity,
    reportLocations,
    topDivisions,
    weeklyTrend,
  ] = await Promise.all([
    db.report.count({ where }),
    db.report.count({ where: { ...where, status: { in: ["VERIFIED", "FIELD_VERIFIED"] } } }),
    db.report.count({ where: { ...where, status: "RESOLVED" } }),
    db.report.groupBy({
      by: ["status"],
      where,
      _count: true,
    }),
    db.report.groupBy({
      by: ["category"],
      where,
      _count: true,
    }),
    db.report.findMany({
      where,
      select: {
        id: true,
        category: true,
        status: true,
        district: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.report.findMany({
      where,
      select: {
        id: true,
        latitude: true,
        longitude: true,
        status: true,
        category: true,
      },
    }),
    db.report.groupBy({
      by: ["district"],
      where,
      _count: true,
      orderBy: { _count: { district: "desc" } },
      take: 5,
    }),
    generateWeeklyTrend(where),
  ]);

  const resolvedReports = await db.report.findMany({
    where: { ...where, status: "RESOLVED", resolvedAt: { not: null } },
    select: {
      createdAt: true,
      resolvedAt: true,
    },
  });

  let avgResolutionTimeDays: number | null = null;
  if (resolvedReports.length > 0) {
    const totalDays = resolvedReports.reduce((sum: number, report: any) => {
      const days = report.resolvedAt!
        .getTime() - report.createdAt.getTime();
      return sum + days / (1000 * 60 * 60 * 24);
    }, 0);
    avgResolutionTimeDays = Math.round(totalDays / resolvedReports.length);
  }

  const resolutionTimeline = await generateResolutionTimeline(where);

  const overview: DashboardStats = {
    totalReports,
    verifiedCount,
    resolvedCount,
    avgResolutionTimeDays,
  };

  const statusCounts: StatusCount[] = statusDistribution.map((item: any) => ({
    status: item.status,
    count: item._count,
  }));

  const categoryCounts: CategoryCount[] = categoryBreakdown.map((item: any) => ({
    category: item.category,
    count: item._count,
  }));

  const activity: RecentActivity[] = recentActivity.map((item: any) => ({
    id: item.id,
    category: item.category,
    status: item.status,
    district: item.district,
    timestamp: item.createdAt.toISOString(),
  }));

  const locations: ReportLocation[] = reportLocations.map((item: any) => ({
    id: item.id,
    latitude: item.latitude,
    longitude: item.longitude,
    status: item.status,
    category: item.category,
  }));

  const divisions: DivisionCount[] = topDivisions.map((item: any) => ({
    name: item.district || "Unknown",
    count: item._count,
  }));

  return {
    overview,
    statusDistribution: statusCounts,
    categoryBreakdown: categoryCounts,
    resolutionTimeline,
    recentActivity: activity,
    reportLocations: locations,
    topDivisions: divisions,
    weeklyTrend,
  };
}

async function generateResolutionTimeline(where: any): Promise<ResolutionTimelinePoint[]> {
  const resolvedReports = await db.report.findMany({
    where: { ...where, status: "RESOLVED", resolvedAt: { not: null } },
    select: {
      createdAt: true,
      resolvedAt: true,
    },
    orderBy: { resolvedAt: "asc" },
  });

  if (resolvedReports.length === 0) return [];

  const timeline = new Map<string, { totalDays: number; count: number }>();

  resolvedReports.forEach((report: any) => {
    const resolvedAt = report.resolvedAt!;
    const year = resolvedAt.getFullYear();
    const month = resolvedAt.getMonth();
    const period = `${year}-${String(month + 1).padStart(2, "0")}`;

    const days = (resolvedAt.getTime() - report.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (!timeline.has(period)) {
      timeline.set(period, { totalDays: 0, count: 0 });
    }

    const entry = timeline.get(period)!;
    entry.totalDays += days;
    entry.count += 1;
  });

  return Array.from(timeline.entries())
    .map(([period, data]) => ({
      period,
      avgResolutionTime: Math.round(data.totalDays / data.count),
      count: data.count,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

async function generateWeeklyTrend(where: any): Promise<WeeklyTrendPoint[]> {
  const reports = await db.report.findMany({
    where,
    select: {
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (reports.length === 0) return [];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const trend = new Map<number, number>();

  reports.forEach((report: any) => {
    const dayOfWeek = report.createdAt.getDay();
    trend.set(dayOfWeek, (trend.get(dayOfWeek) || 0) + 1);
  });

  return daysOfWeek.map((day, index) => ({
    day,
    count: trend.get(index) || 0,
  }));
}

export default async function DashboardPage() {
  // Restrict access to ADMIN and DS_OFFICER only
  const user = await requireRole(["ADMIN", "DS_OFFICER"]);

  const initialData = await getDashboardData({});

  return <DashboardClient initialData={initialData} />;
}
