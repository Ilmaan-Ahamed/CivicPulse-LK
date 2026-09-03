"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { StatusCount } from "@/types/dashboard";

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#f59e0b",
  UNDER_VERIFICATION: "#3b82f6",
  VERIFIED: "#f59e0b",
  ASSIGNED: "#6366f1",
  IN_PROGRESS: "#f97316",
  FIELD_VERIFIED: "#10b981",
  RESOLVED: "#f97316",
  REJECTED: "#6b7280",
  CLOSED: "#6b7280",
};

interface StatusChartProps {
  data: StatusCount[];
  isLoading?: boolean;
}

export function StatusChart({ data, isLoading }: StatusChartProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.statusDistribution")}</CardTitle>
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
          <CardTitle>{t("dashboard.statusDistribution")}</CardTitle>
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
    name: item.status,
    value: item.count,
    fill: STATUS_COLORS[item.status] || "#6b7280",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.statusDistribution")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={256}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
