"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusCircle, MapPin, Clock, CheckCircle2, ShieldCheck, Search, Filter } from "lucide-react";
import { CaseCard, CaseCardData } from "@/components/shared/CaseCard";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSharedIssues } from "@/lib/report-sync";

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"my-reports" | "nearby">("my-reports");
  const sharedIssues = useSharedIssues();

  const citizenSeedReports: CaseCardData[] = [
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

  const sharedCitizenReports: CaseCardData[] = Array.from(
    new Map(
      sharedIssues.map((issue) => [issue.id, {
        id: issue.id,
        caseNumber: issue.caseNumber,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        status: issue.status,
        priorityScore: issue.priorityScore,
        address: issue.address,
        dsDivisionName: issue.dsDivisionName,
        imageUrl: issue.imageUrl,
        verificationCount: 1,
        verificationThreshold: 3,
        createdAt: issue.createdAt,
      }]),
    ).values(),
  );

  const myReports: CaseCardData[] = [...sharedCitizenReports, ...citizenSeedReports];
  const nearbyReports: CaseCardData[] = [
    ...sharedCitizenReports,
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

  const mapMarkers = [...sharedCitizenReports, ...nearbyReports].reduce<Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    latitude: number;
    longitude: number;
    address: string;
  }>>((acc, report) => {
    if (acc.some((item) => item.id === report.id)) return acc;

    acc.push({
      id: report.id,
      title: report.title,
      category: report.category,
      status: report.status,
      latitude: report.category === "ROADS" ? 6.8905 : report.category === "DRAINAGE" ? 6.9344 : report.category === "WATER" ? 6.0268 : 7.2625,
      longitude: report.category === "ROADS" ? 79.855 : report.category === "DRAINAGE" ? 79.8519 : report.category === "WATER" ? 80.217 : 80.5972,
      address: report.address,
    });

    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
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
      <div className="max-w-7xl mx-auto flex items-center gap-4 border-b border-border dark:border-[#333333] pb-3">
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

      <div className="max-w-7xl mx-auto card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base card-heading dark:text-white">MapCN.dev issue map</h2>
            <p className="text-[11px] body-text dark:text-slate-400">Live citizen reports visible to your dashboard with permission-based access.</p>
          </div>
          <span className="text-[10px] font-mono text-orange-400">{mapMarkers.length} visible issues</span>
        </div>
        <InteractiveMap markers={mapMarkers} center={[6.9271, 79.8612]} zoom={11} />
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
