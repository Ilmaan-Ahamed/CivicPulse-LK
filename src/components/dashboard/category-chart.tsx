"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
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
          <div className="h-64 animate-pulse rounded bg-muted" />
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
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            {t("dashboard.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.count,
    fill: CATEGORY_COLORS[item.category] || "#6b7280",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.categoryBreakdown")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
