"use client";

import React from "react";
import { Category, ReportStatus } from "@prisma/client";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatusChart } from "@/components/dashboard/status-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { ResolutionTimeline } from "@/components/dashboard/resolution-timeline";
import { ReportMap } from "@/components/dashboard/report-map";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type {
  DashboardStats,
  StatusCount,
  CategoryCount,
  ResolutionTimelinePoint,
  RecentActivity,
  ReportLocation,
} from "@/types/dashboard";

interface DashboardClientProps {
  initialData: {
    overview: DashboardStats;
    statusDistribution: StatusCount[];
    categoryBreakdown: CategoryCount[];
    resolutionTimeline: ResolutionTimelinePoint[];
    recentActivity: RecentActivity[];
    reportLocations: ReportLocation[];
  };
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { t } = useLanguage();
  const [data, setData] = React.useState(initialData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({
    district: "",
    category: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const handleFilterChange = async (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });

      const response = await fetch(`/api/dashboard?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = async () => {
    const clearedFilters = {
      district: "",
      category: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(clearedFilters);
    setIsLoading(true);

    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{t("dashboard.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            Public transparency dashboard for civic infrastructure reports
          </p>
        </div>

        <div className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("dashboard.filters")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium">{t("dashboard.allDistricts")}</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.district}
                onChange={(e) => handleFilterChange("district", e.target.value)}
              >
                <option value="">{t("dashboard.allDistricts")}</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
                <option value="Jaffna">Jaffna</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">{t("dashboard.allCategories")}</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">{t("dashboard.allCategories")}</option>
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">{t("dashboard.allStatuses")}</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">{t("dashboard.allStatuses")}</option>
                {Object.values(ReportStatus).map((stat) => (
                  <option key={stat} value={stat}>
                    {stat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">{t("dashboard.dateRange")}</label>
              <input
                type="date"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">&nbsp;</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  {t("dashboard.clearFilters")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label={t("dashboard.totalReports")}
            value={data.overview.totalReports}
            isLoading={isLoading}
          />
          <StatsCard
            label={t("dashboard.verifiedReports")}
            value={data.overview.verifiedCount}
            isLoading={isLoading}
          />
          <StatsCard
            label={t("dashboard.resolvedReports")}
            value={data.overview.resolvedCount}
            isLoading={isLoading}
          />
          <StatsCard
            label={t("dashboard.avgResolutionTime")}
            value={
              data.overview.avgResolutionTimeDays !== null
                ? `${data.overview.avgResolutionTimeDays} ${t("dashboard.days")}`
                : "N/A"
            }
            isLoading={isLoading}
          />
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <StatusChart data={data.statusDistribution} isLoading={isLoading} />
          <CategoryChart data={data.categoryBreakdown} isLoading={isLoading} />
        </div>

        <div className="mb-8">
          <ResolutionTimeline data={data.resolutionTimeline} isLoading={isLoading} />
        </div>

        <div className="mb-8">
          <ReportMap data={data.reportLocations} isLoading={isLoading} />
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("dashboard.recentActivity")}</h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-muted-foreground">{t("dashboard.noData")}</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{activity.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.district || "Unknown District"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{activity.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
