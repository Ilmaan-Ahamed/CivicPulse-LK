import { Category, ReportStatus } from "@prisma/client";

export interface DashboardStats {
  totalReports: number;
  verifiedCount: number;
  resolvedCount: number;
  avgResolutionTimeDays: number | null;
}

export interface StatusCount {
  status: ReportStatus;
  count: number;
}

export interface CategoryCount {
  category: Category;
  count: number;
}

export interface ResolutionTimelinePoint {
  period: string;
  avgResolutionTime: number | null;
  count: number;
}

export interface RecentActivity {
  id: string;
  category: Category;
  status: ReportStatus;
  district: string | null;
  timestamp: string;
}

export interface ReportLocation {
  id: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  category: Category;
  address?: string | null;
}

export interface DivisionCount {
  name: string;
  count: number;
}

export interface WeeklyTrendPoint {
  day: string;
  count: number;
}

export interface DashboardResponse {
  success: true;
  data: {
    overview: DashboardStats;
    statusDistribution: StatusCount[];
    categoryBreakdown: CategoryCount[];
    resolutionTimeline: ResolutionTimelinePoint[];
    recentActivity: RecentActivity[];
    reportLocations: ReportLocation[];
    topDivisions: DivisionCount[];
    weeklyTrend: WeeklyTrendPoint[];
    availableDistricts: string[];
  };
}
