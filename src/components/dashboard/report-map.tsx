"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveMap, type MapMarker } from "@/components/map/InteractiveMap";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ReportLocation } from "@/types/dashboard";

interface ReportMapProps {
  data: ReportLocation[];
  isLoading?: boolean;
}

export function ReportMap({ data, isLoading }: ReportMapProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.reportMap")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.reportMap")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            {t("dashboard.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const markers: MapMarker[] = data.map((item) => ({
    id: item.id,
    title: `${item.category} - ${item.status}`,
    category: item.category,
    status: item.status,
    latitude: item.latitude,
    longitude: item.longitude,
    address: "",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.reportMap")}</CardTitle>
      </CardHeader>
      <CardContent>
        <InteractiveMap markers={markers} />
      </CardContent>
    </Card>
  );
}
