"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusCircle, MapPin, Clock, CheckCircle2, ShieldCheck, Search, Filter } from "lucide-react";
import { CaseCard, CaseCardData } from "@/components/shared/CaseCard";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"my-reports" | "nearby">("my-reports");

  const myReports: CaseCardData[] = [
    {
      id: "case-1042",
      caseNumber: "CP-2026-1042",
      title: "Hazardous Deep Potholes near Bambalapitiya Junction",
      description: "Severe road surface damage causing vehicle accidents and traffic congestion on A2 main corridor near Galle Road Bamba junction.",
      category: "ROADS",
      status: "VERIFIED",
      priorityScore: 88.5,
      address: "Galle Road, Bambalapitiya, Colombo 04",
      dsDivisionName: "Colombo DS Office",
      imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      verificationCount: 4,
      verificationThreshold: 3,
      createdAt: "2026-08-10",
    },
  ];

  const nearbyReports: CaseCardData[] = [
    {
      id: "case-1043",
      caseNumber: "CP-2026-1043",
      title: "Blocked Main Canal Causing Pettah Market Flooding",
      description: "Polythene and debris blockages in the primary drainage channel adjacent to Central Bus Stand during heavy rains.",
      category: "DRAINAGE",
      status: "IN_PROGRESS",
      priorityScore: 76.0,
      address: "Bodhiraja Mawatha, Pettah, Colombo 11",
      dsDivisionName: "Colombo DS Office",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80",
      verificationCount: 3,
      verificationThreshold: 3,
      createdAt: "2026-08-11",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-[#F97316] dark:text-[#FF8C00] uppercase tracking-wider">
            {currentUser.dsDivisionName}
          </span>
          <h1 className="text-2xl page-title dark:text-white">{t("dash.citizen.title")}</h1>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-white">{currentUser.name}</span>. Report public infrastructure hazards or track community updates.
          </p>
        </div>

        {/* Primary CTA Button */}
        <Link
          href="/dashboard/citizen/report"
          className="btn-primary-orange px-6 py-3 text-xs flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t("hero.cta.report")}</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 border-b border-[var(--border)] dark:border-[#333333] pb-3">
        <button
          onClick={() => setActiveTab("my-reports")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeTab === "my-reports" ? "bg-[#F97316] dark:bg-[#FF8C00] text-white" : "text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          My Submitted Reports ({myReports.length})
        </button>
        <button
          onClick={() => setActiveTab("nearby")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeTab === "nearby" ? "bg-[#F97316] dark:bg-[#FF8C00] text-white" : "text-slate-600 dark:text-[#B0B0B0] hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Nearby Community Activity ({nearbyReports.length})
        </button>
      </div>

      {/* Case Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {(activeTab === "my-reports" ? myReports : nearbyReports).map((c) => (
          <CaseCard key={c.id} caseData={c} />
        ))}
      </div>
    </div>
  );
}
