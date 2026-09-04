import React from "react";
import { UserRole } from "@/lib/auth/rbac";
import { User, ShieldCheck, HeartHandshake, Building, Landmark, UserCheck, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

export function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const { t } = useLanguage();

  const getRoleConfig = (r: UserRole) => {
    switch (r) {
      case "CITIZEN":
        return {
          label: t("role.citizen"),
          bg: "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
          icon: User,
        };
      case "NGO_PARTNER":
        return {
          label: t("role.ngo_partner"),
          bg: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
          icon: Building,
        };
      case "DS_OFFICER":
        return {
          label: t("role.ds_officer"),
          bg: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
          icon: UserCheck,
        };
      case "ADMIN":
      default:
        return {
          label: t("role.admin"),
          bg: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
          icon: ShieldAlert,
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border ${config.bg}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
}
