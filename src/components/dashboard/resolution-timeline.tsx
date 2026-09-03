"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ResolutionTimelinePoint } from "@/types/dashboard";

interface ResolutionTimelineProps {
  data: ResolutionTimelinePoint[];
  isLoading?: boolean;
}

export function ResolutionTimeline({ data, isLoading }: ResolutionTimelineProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.resolutionTimeline")}</CardTitle>
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
          <CardTitle>{t("dashboard.resolutionTimeline")}</CardTitle>
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
    period: item.period,
    days: item.avgResolutionTime,
    count: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.resolutionTimeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={256}>
          <AreaChart data={chartData}>
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="days"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name={t("dashboard.avgResolutionTime")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
