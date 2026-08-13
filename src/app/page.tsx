"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  PlusCircle,
  Map,
  CheckCircle2,
  Building2,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Wrench,
  BarChart3,
  Globe2,
  Clock,
  HeartHandshake,
  Landmark,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CaseCard, CaseCardData } from "@/components/shared/CaseCard";

export default function LandingPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"step1" | "step2" | "step3" | "step4">("step1");

  const sampleCases: CaseCardData[] = [
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
      imageUrl: "https://images.unsplash.com/photo-1595856341628-fdcee0607911?auto=format&fit=crop&w=800&q=80",
      verificationCount: 4,
      verificationThreshold: 3,
      createdAt: "2026-08-10",
    },
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
      imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
      verificationCount: 3,
      verificationThreshold: 3,
      createdAt: "2026-08-11",
    },
    {
      id: "case-1045",
      caseNumber: "CP-2026-1045",
      title: "Burst Main Water Pipe at Galle Fort Pedestrian Walkway",
      description: "Clean water leak under high pressure washing away paved heritage stones near Rampart Street.",
      category: "WATER",
      status: "RESOLVED",
      priorityScore: 91.0,
      address: "Rampart Street, Galle Fort, Galle",
      dsDivisionName: "Galle DS Office",
      imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
      verificationCount: 5,
      verificationThreshold: 3,
      createdAt: "2026-08-12",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[var(--background)] pt-20 pb-28 text-[var(--foreground)] border-b border-[var(--border)] dark:border-slate-800">
        {/* Glow & Grid Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-orange-500/8 dark:bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-8 dark:opacity-15 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="badge-orange">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
            <span>Empowering Citizens & DS Offices Across Sri Lanka</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl page-title tracking-tight leading-[1.1]">
            Community-Verified Public Infrastructure Reporting for <br />
            <span className="icon-orange">
              Sri Lanka
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg body-text leading-relaxed font-normal">
            CivicPulse LK connects Sri Lankan citizens, nearby community verifiers, Divisional Secretariats, government agencies, NGOs, and volunteers on a single transparent platform.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard/citizen/report"
              className="btn-primary-orange w-full sm:w-auto text-sm flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{t("hero.cta.report")}</span>
            </Link>

            <Link
              href="/transparency"
              className="btn-secondary-orange w-full sm:w-auto text-sm flex items-center justify-center gap-2"
            >
              <Map className="w-5 h-5" />
              <span>{t("hero.cta.explore")}</span>
            </Link>
          </div>

          {/* Real Live Stats Counter Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-[var(--border)] dark:border-slate-800/80">
            <div className="p-4 rounded-2xl card-light dark:bg-slate-900/60 dark:border-slate-800/60 backdrop-blur-xs">
              <p className="text-3xl card-stat dark:text-white font-mono">1,045+</p>
              <p className="text-xs card-subtext dark:text-slate-400 font-medium mt-1">{t("stats.reported")}</p>
            </div>
            <div className="p-4 rounded-2xl card-light dark:bg-slate-900/60 dark:border-slate-800/60 backdrop-blur-xs">
              <p className="text-3xl card-stat dark:text-amber-400 font-mono">980+</p>
              <p className="text-xs card-subtext dark:text-slate-400 font-medium mt-1">{t("stats.verified")}</p>
            </div>
            <div className="p-4 rounded-2xl card-light dark:bg-slate-900/60 dark:border-slate-800/60 backdrop-blur-xs">
              <p className="text-3xl card-stat icon-orange dark:text-orange-400 font-mono">42</p>
              <p className="text-xs card-subtext dark:text-slate-400 font-medium mt-1">{t("stats.assigned")}</p>
            </div>
            <div className="p-4 rounded-2xl card-light dark:bg-slate-900/60 dark:border-slate-800/60 backdrop-blur-xs">
              <p className="text-3xl card-stat icon-orange dark:text-orange-400 font-mono">864+</p>
              <p className="text-xs card-subtext dark:text-slate-400 font-medium mt-1">{t("stats.resolved")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW CIVICPULSE WORKS (4-STAGE INTERACTIVE WORKFLOW) */}
      <section className="py-20 bg-[var(--surface)] text-[var(--foreground)] border-b border-[var(--border)] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest icon-orange">
              Transparent National Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl page-title">How CivicPulse Works</h3>
            <p className="text-xs sm:text-sm body-text max-w-2xl mx-auto">
              From initial photo capture by a citizen to community verification and institutional repair execution.
            </p>
          </div>

          {/* Interactive 4-Stage Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <button
              onClick={() => setActiveTab("step1")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === "step1"
                  ? "badge-light border-[#F97316] text-slate-900 dark:text-white shadow-lg"
                  : "card-light dark:bg-[#0a0a0a] dark:border-[#333333] text-slate-500 dark:text-slate-400 hover:border-[#F97316] dark:hover:border-[#FF8C00]"
              }`}
            >
              <span className="text-[10px] font-mono font-bold icon-orange uppercase">Stage 01</span>
              <h4 className="text-sm font-bold mt-1 card-heading dark:text-white">{t("workflow.step1.title")}</h4>
            </button>

            <button
              onClick={() => setActiveTab("step2")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === "step2"
                  ? "badge-light border-[#F97316] text-slate-900 dark:text-white shadow-lg"
                  : "card-light dark:bg-[#0a0a0a] dark:border-[#333333] text-slate-500 dark:text-slate-400 hover:border-[#F97316] dark:hover:border-[#FF8C00]"
              }`}
            >
              <span className="text-[10px] font-mono font-bold icon-orange uppercase">Stage 02</span>
              <h4 className="text-sm font-bold mt-1 card-heading dark:text-white">{t("workflow.step2.title")}</h4>
            </button>

            <button
              onClick={() => setActiveTab("step3")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === "step3"
                  ? "badge-light border-[#F97316] text-slate-900 dark:text-white shadow-lg"
                  : "card-light dark:bg-[#0a0a0a] dark:border-[#333333] text-slate-500 dark:text-slate-400 hover:border-[#F97316] dark:hover:border-[#FF8C00]"
              }`}
            >
              <span className="text-[10px] font-mono font-bold icon-orange uppercase">Stage 03</span>
              <h4 className="text-sm font-bold mt-1 card-heading dark:text-white">{t("workflow.step3.title")}</h4>
            </button>

            <button
              onClick={() => setActiveTab("step4")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === "step4"
                  ? "badge-light border-[#F97316] text-slate-900 dark:text-white shadow-lg"
                  : "card-light dark:bg-[#0a0a0a] dark:border-[#333333] text-slate-500 dark:text-slate-400 hover:border-[#F97316] dark:hover:border-[#FF8C00]"
              }`}
            >
              <span className="text-[10px] font-mono font-bold icon-orange uppercase">Stage 04</span>
              <h4 className="text-sm font-bold mt-1 card-heading dark:text-white">{t("workflow.step4.title")}</h4>
            </button>
          </div>

          {/* Active Tab Explanation Display Card */}
          <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl badge-light border-[#F97316] icon-orange flex items-center justify-center font-bold">
                {activeTab === "step1" && <PlusCircle className="w-6 h-6" />}
                {activeTab === "step2" && <ShieldCheck className="w-6 h-6" />}
                {activeTab === "step3" && <Landmark className="w-6 h-6" />}
                {activeTab === "step4" && <CheckCircle2 className="w-6 h-6" />}
              </div>

              <h4 className="text-xl card-heading dark:text-white">
                {activeTab === "step1" && t("workflow.step1.title")}
                {activeTab === "step2" && t("workflow.step2.title")}
                {activeTab === "step3" && t("workflow.step3.title")}
                {activeTab === "step4" && t("workflow.step4.title")}
              </h4>

              <p className="text-sm body-text leading-relaxed">
                {activeTab === "step1" && t("workflow.step1.desc")}
                {activeTab === "step2" && t("workflow.step2.desc")}
                {activeTab === "step3" && t("workflow.step3.desc")}
                {activeTab === "step4" && t("workflow.step4.desc")}
              </p>
            </div>

            <div className="card-light dark:bg-[#111111] dark:border-[#333333] rounded-2xl p-5 text-xs space-y-3 font-mono body-text">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] dark:border-[#333333]">
                <span className="icon-orange">System Pipeline</span>
                <span>Active</span>
              </div>
              <p>✓ Automated GPS Geocoding</p>
              <p>✓ AI Priority Advisory Scoring (1-100)</p>
              <p>✓ Divisional Secretariat Routing</p>
              <p>✓ Photographic Proof Publishing</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PUBLIC CASE PREVIEWS */}
      <section className="py-20 bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border)] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest icon-orange">
                Real-Time Public Accountability
              </h2>
              <h3 className="text-3xl page-title mt-1">Live Case Activity Feed</h3>
            </div>
            <Link
              href="/transparency"
              className="text-xs font-semibold icon-orange hover:text-orange-500 dark:hover:text-orange-300 flex items-center gap-1.5"
            >
              <span>View Full Interactive Transparency Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleCases.map((c) => (
              <CaseCard key={c.id} caseData={c} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. ECOSYSTEM & 7 ROLES SECTION */}
      <section className="py-20 bg-[var(--surface)] text-[var(--foreground)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest icon-orange">
              Integrated Civic Ecosystem
            </h2>
            <h3 className="text-3xl page-title">Built for Every Stakeholder Role</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl card-light dark:bg-[#0a0a0a] dark:border-[#333333] space-y-2">
              <Users className="w-6 h-6 icon-orange" />
              <h4 className="text-base card-heading dark:text-white">Citizens</h4>
              <p className="text-xs body-text">Report problems under 60 seconds with camera capture and instant GPS.</p>
            </div>
            <div className="p-6 rounded-2xl card-light dark:bg-[#0a0a0a] dark:border-[#333333] space-y-2">
              <ShieldCheck className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h4 className="text-base card-heading dark:text-white">Community Verifiers</h4>
              <p className="text-xs body-text">Local residents confirm or dispute reports before institutional routing.</p>
            </div>
            <div className="p-6 rounded-2xl card-light dark:bg-[#0a0a0a] dark:border-[#333333] space-y-2">
              <HeartHandshake className="w-6 h-6 text-purple-500 dark:text-purple-400" />
              <h4 className="text-base card-heading dark:text-white">Field Volunteers</h4>
              <p className="text-xs body-text">Conduct physical inspections, capture evidence, and upload inspection notes.</p>
            </div>
            <div className="p-6 rounded-2xl card-light dark:bg-[#0a0a0a] dark:border-[#333333] space-y-2">
              <Globe2 className="w-6 h-6 icon-orange" />
              <h4 className="text-base card-heading dark:text-white">NGO Partners</h4>
              <p className="text-xs body-text">Pledge funding, volunteers, or materials for high-urgency community needs.</p>
            </div>
            <div className="p-6 rounded-2xl card-light dark:bg-[#0a0a0a] dark:border-[#333333] space-y-2">
              <Landmark className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              <h4 className="text-base card-heading dark:text-white">DS Officers</h4>
              <p className="text-xs body-text">Central operational triage console, AI priority ordering, and RDA routing.</p>
            </div>
            <div className="p-6 rounded-2xl card-light dark:bg-[#0a0a0a] dark:border-[#333333] space-y-2">
              <Building2 className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              <h4 className="text-base card-heading dark:text-white">Government Agencies</h4>
              <p className="text-xs body-text">RDA & Water Board workstations with repair evidence upload and status tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-16 bg-[var(--surface)] dark:bg-gradient-to-r dark:from-[#FF8C00] dark:to-black text-[var(--foreground)] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl page-title">Ready to Make Sri Lankan Infrastructure Accountable?</h2>
          <p className="text-sm body-text">
            Join citizens and Divisional Secretariat officers building a transparent public infrastructure record.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard/citizen/report"
              className="btn-primary-orange px-6 py-3 text-xs"
            >
              Report an Issue Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
