"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CategoryCount } from "@/types/dashboard";

const CATEGORY_COLORS: Record<string, string> = {
  ROAD_DAMAGE: "#3b82f6",
  DRAINAGE: "#06b6d4",
  STREETLIGHT: "#f59e0b",
  WATER_SUPPLY: "#10b981",
  WASTE: "#8b5cf6",
  BRIDGE: "#ec4899",
  PUBLIC_BUILDING: "#6366f1",
  SIDEWALK: "#14b8a6",
  TRAFFIC_SIGNAL: "#f97316",
  OTHER: "#6b7280",
};

interface CategoryChartProps {
  data: CategoryCount[];
  isLoading?: boolean;
}

export function CategoryChart({ data, isLoading }: CategoryChartProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.categoryBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.categoryBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            {t("dashboard.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.categoryBreakdown")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={item.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: CATEGORY_COLORS[item.category] || "#6b7280",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
