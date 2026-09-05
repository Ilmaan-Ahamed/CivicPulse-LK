"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Users,
  Building2,
  Landmark,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  LogOut,
  User,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { UserRole } from "@/lib/auth/rbac";

interface RoleCardConfig {
  role: UserRole;
  titleKey: string;
  subtitleKey: string;
  descKey: string;
  btnKey: string;
  pillKeys: [string, string, string];
  path: string;
  badge: string;
  icon: React.ElementType;
  gradient: string;
  borderHover: string;
  glowColor: string;
  accentBg: string;
  badgeBg: string;
  textColor: string;
  btnClass: string;
}

const ROLE_CARDS: RoleCardConfig[] = [
  {
    role: "CITIZEN",
    titleKey: "roleSelect.citizen.title",
    subtitleKey: "roleSelect.citizen.subtitle",
    descKey: "roleSelect.citizen.desc",
    btnKey: "roleSelect.citizen.btn",
    pillKeys: [
      "roleSelect.citizen.pill1",
      "roleSelect.citizen.pill2",
      "roleSelect.citizen.pill3",
    ],
    path: "/dashboard/citizen",
    badge: "Public Access",
    icon: Users,
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    borderHover: "hover:border-emerald-500/60 dark:hover:border-emerald-400/60",
    glowColor: "group-hover:shadow-emerald-500/20",
    accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
    textColor: "text-emerald-600 dark:text-emerald-400",
    btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/30",
  },
  {
    role: "NGO_PARTNER",
    titleKey: "roleSelect.ngo.title",
    subtitleKey: "roleSelect.ngo.subtitle",
    descKey: "roleSelect.ngo.desc",
    btnKey: "roleSelect.ngo.btn",
    pillKeys: [
      "roleSelect.ngo.pill1",
      "roleSelect.ngo.pill2",
      "roleSelect.ngo.pill3",
    ],
    path: "/dashboard/ngo",
    badge: "Civil Society",
    icon: Building2,
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    borderHover: "hover:border-blue-500/60 dark:hover:border-blue-400/60",
    glowColor: "group-hover:shadow-blue-500/20",
    accentBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",
    textColor: "text-blue-600 dark:text-blue-400",
    btnClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 dark:shadow-blue-900/30",
  },
  {
    role: "DS_OFFICER",
    titleKey: "roleSelect.ds.title",
    subtitleKey: "roleSelect.ds.subtitle",
    descKey: "roleSelect.ds.desc",
    btnKey: "roleSelect.ds.btn",
    pillKeys: [
      "roleSelect.ds.pill1",
      "roleSelect.ds.pill2",
      "roleSelect.ds.pill3",
    ],
    path: "/dashboard/ds-officer",
    badge: "State Authority",
    icon: Landmark,
    gradient: "from-[#F97316]/20 via-[#F97316]/5 to-transparent",
    borderHover: "hover:border-[#F97316]/60 dark:hover:border-[#FF8C00]/60",
    glowColor: "group-hover:shadow-orange-500/20",
    accentBg: "bg-orange-500/10 text-[#F97316] dark:text-[#FF8C00] border-orange-500/20",
    badgeBg: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800/40",
    textColor: "text-[#F97316] dark:text-[#FF8C00]",
    btnClass: "bg-[#F97316] hover:bg-[#EA580C] dark:bg-[#FF8C00] dark:hover:bg-[#FF6600] text-white shadow-lg shadow-orange-600/25",
  },
  {
    role: "ADMIN",
    titleKey: "roleSelect.admin.title",
    subtitleKey: "roleSelect.admin.subtitle",
    descKey: "roleSelect.admin.desc",
    btnKey: "roleSelect.admin.btn",
    pillKeys: [
      "roleSelect.admin.pill1",
      "roleSelect.admin.pill2",
      "roleSelect.admin.pill3",
    ],
    path: "/dashboard/admin",
    badge: "Super Admin",
    icon: ShieldCheck,
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    borderHover: "hover:border-purple-500/60 dark:hover:border-purple-400/60",
    glowColor: "group-hover:shadow-purple-500/20",
    accentBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/40",
    textColor: "text-purple-600 dark:text-purple-400",
    btnClass: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 dark:shadow-purple-900/30",
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const { switchRole, currentUser, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSelectRole = (card: RoleCardConfig) => {
    setSelectedRole(card.role);
    setIsNavigating(true);
    switchRole(card.role);

    setTimeout(() => {
      router.push(card.path);
    }, 280);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden px-4 sm:px-6 lg:px-8 py-10">
      {/* Background Ambient Glows & Grid */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#FDF6E3] via-[#FDEEDC] to-[#FFE4C4] dark:from-black dark:via-[#070707] dark:to-[#000000] -z-20 transition-colors" />
      
      {/* Ambient Mesh Gradient Orbs */}
      <div className="fixed top-[-10%] left-[20%] w-[650px] h-[650px] bg-gradient-to-br from-orange-400/15 via-amber-400/10 to-transparent dark:from-[#FF8C00]/10 dark:via-orange-600/5 dark:to-transparent blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[15%] w-[600px] h-[600px] bg-gradient-to-tl from-emerald-500/10 via-blue-500/5 to-transparent dark:from-purple-900/15 dark:via-blue-900/5 dark:to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-[-10%] w-[450px] h-[450px] bg-purple-500/10 dark:bg-[#FF8C00]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      {/* Civic Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.035] dark:opacity-[0.08] bg-[radial-gradient(#F97316_1.5px,transparent_1.5px)] [background-size:28px_28px] pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full relative z-10 my-auto">
        {/* Brand Shield & Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] dark:from-[#FFA500] dark:to-[#FF6600] text-white flex items-center justify-center shadow-xl shadow-orange-600/25 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
              <Shield className="w-7 h-7" />
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/5 backdrop-blur-md border border-[#E8D5B5] dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F97316] dark:text-[#FF8C00]" />
            <span>Civic Operating System of Sri Lanka</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
            {t("roleSelect.title")}
          </h1>
          <p className="text-base sm:text-lg font-bold text-[#F97316] dark:text-[#FF8C00] mb-2">
            {t("roleSelect.subtitle")}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B0B0B0] max-w-lg mx-auto">
            {t("roleSelect.description")}
          </p>

          {/* Active Logged-In User Banner */}
          {isAuthenticated && (
            <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md border border-[#E8D5B5] dark:border-[#333333] shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                  {t("roleSelect.activeUser")}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentUser.name}
                </span>{" "}
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                  ({currentUser.email})
                </span>
              </div>
              <button
                onClick={logout}
                title={t("roleSelect.switchUser")}
                className="ml-2 p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1 text-[11px] font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("nav.signOut")}</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Role Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            const isCardSelected = selectedRole === card.role;

            return (
              <div
                key={card.role}
                onClick={() => !isNavigating && handleSelectRole(card)}
                className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 cursor-pointer overflow-hidden border ${
                  card.borderHover
                } ${card.glowColor} ${
                  isCardSelected
                    ? "scale-[1.02] border-[#F97316] dark:border-[#FF8C00] shadow-2xl ring-2 ring-orange-500/50"
                    : "hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10 shadow-lg shadow-slate-200/50 dark:shadow-black/40"
                } bg-white/80 dark:bg-[#0c0c0c]/85 backdrop-blur-xl border-[#E8D5B5] dark:border-[#222222]`}
              >
                {/* Top Subtle Gradient Light Layer */}
                <div
                  className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${card.gradient} pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity`}
                />

                {/* Card Top / Header */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    {/* Role Icon Container */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${card.accentBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Role Authority Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeBg}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Role Title & Subtitle */}
                  <div className="mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {t(card.subtitleKey)}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-between">
                      <span>{t(card.titleKey)}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mb-6 min-h-[48px]">
                    {t(card.descKey)}
                  </p>
                </div>

                {/* Card Bottom / Features & Action */}
                <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Capability Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {card.pillKeys.map((pillKey) => (
                      <span
                        key={pillKey}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                      >
                        {t(pillKey)}
                      </span>
                    ))}
                  </div>

                  {/* Select Role Button */}
                  <button
                    type="button"
                    disabled={isNavigating}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isNavigating) handleSelectRole(card);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg ${card.btnClass}`}
                  >
                    {isCardSelected ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t("roleSelect.entering")}</span>
                      </>
                    ) : (
                      <>
                        <span>{t(card.btnKey)}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Switch Account / Home Navigation Link */}
        <div className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="hover:text-[#F97316] dark:hover:text-[#FF8C00] transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowRight className="w-3 h-3 rotate-180" />
            <span>{t("auth.backToHome")}</span>
          </Link>
          <span className="hidden sm:inline opacity-30">•</span>
          <Link
            href="/login"
            className="hover:text-[#F97316] dark:hover:text-[#FF8C00] transition-colors inline-flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>{t("roleSelect.switchUser")}</span>
          </Link>
        </div>
      </div>

      {/* Footer Branding Info */}
      <footer className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-12 py-2">
        CivicPulse LK • Democratic Governance & Transparency Initiative • Sri Lanka
      </footer>
    </div>
  );
}
