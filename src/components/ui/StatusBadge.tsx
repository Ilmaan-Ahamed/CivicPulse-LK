import React from "react";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Wrench,
  AlertTriangle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2",
  };

  const getStatusConfig = (st: string) => {
    switch (st) {
      case "PENDING":
        return {
          label: t("status.pending"),
          bg: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          icon: Clock,
        };
      case "UNDER_VERIFICATION":
        return {
          label: t("status.under_verification"),
          bg: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800",
          icon: ShieldCheck,
        };
      case "VERIFIED":
        return {
          label: t("status.verified"),
          bg: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
          icon: CheckCircle2,
        };
      case "ASSIGNED":
        return {
          label: t("status.assigned"),
          bg: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800",
          icon: Building2,
        };
      case "IN_PROGRESS":
        return {
          label: t("status.in_progress"),
          bg: "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800",
          icon: Wrench,
        };
      case "RESOLVED":
        return {
          label: t("status.resolved"),
          bg: "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800",
          icon: CheckCircle2,
        };
      case "DISPUTED":
        return {
          label: t("status.disputed"),
          bg: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800",
          icon: AlertTriangle,
        };
      case "REJECTED":
        return {
          label: t("status.rejected"),
          bg: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700",
          icon: XCircle,
        };
      case "WITHDRAWN":
      default:
        return {
          label: t("status.withdrawn"),
          bg: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700",
          icon: RotateCcw,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${sizeClasses[size]} ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
