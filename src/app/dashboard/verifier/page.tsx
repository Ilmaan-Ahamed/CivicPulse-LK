"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, SkipForward, AlertTriangle, Eye, Award } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TrustScore } from "@/components/ui/TrustScore";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function VerifierDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [activeQueueTab, setActiveQueueTab] = useState<"queue" | "history">("queue");

  const [queueCases, setQueueCases] = useState([
    {
      id: "case-1044",
      caseNumber: "CP-2026-1044",
      title: "Non-Functional Streetlights on Kandy Peradeniya Corridor",
      description: "Five consecutive solar streetlights have gone dark along the main university access road, compromising safety at night.",
      category: "STREETLIGHTS",
      priorityScore: 62.0,
      distance: "0.8 km away",
      address: "Gatembe, Peradeniya Road, Kandy",
      imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
      currentConfirmations: 2,
      threshold: 3,
      reporterTrust: 85.0,
      aiDuplicateNotice: "Advisory: 1 similar streetlight issue reported 3.2km away.",
    },
    {
      id: "case-1046",
      caseNumber: "CP-2026-1046",
      title: "Collapsed Drainage Retaining Wall in Nugegoda",
      description: "Heavy rain damaged 8m segment of concrete canal wall near high street market.",
      category: "DRAINAGE",
      priorityScore: 81.0,
      distance: "1.4 km away",
      address: "High Level Road, Nugegoda",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80",
      currentConfirmations: 1,
      threshold: 3,
      reporterTrust: 90.0,
    },
  ]);

  const [history, setHistory] = useState([
    {
      id: "case-1042",
      caseNumber: "CP-2026-1042",
      title: "Hazardous Deep Potholes near Bambalapitiya Junction",
      decision: "CONFIRMED",
      timestamp: "Aug 11, 2026",
    },
  ]);

  const handleDecision = (id: string, decision: "CONFIRM" | "DISPUTE" | "SKIP") => {
    const item = queueCases.find((c) => c.id === id);
    setQueueCases(queueCases.filter((c) => c.id !== id));

    if (item && (decision === "CONFIRM" || decision === "DISPUTE")) {
      setHistory([
        {
          id: item.id,
          caseNumber: item.caseNumber,
          title: item.title,
          decision: decision === "CONFIRM" ? "CONFIRMED" : "DISPUTED",
          timestamp: "Just now",
        },
        ...history,
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* Verifier Header Banner */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 icon-orange dark:text-blue-400" />
            <h1 className="text-2xl page-title dark:text-white">{t("dash.verifier.title")}</h1>
          </div>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            Evaluating citizen infrastructure reports within your Divisional Secretariat radius.
          </p>
        </div>

        <div className="flex items-center gap-3 card-light dark:bg-slate-950 dark:border-slate-800 p-3 rounded-2xl border">
          <div>
            <p className="text-[10px] card-subtext dark:text-slate-500 font-medium">Verifier Trust Score</p>
            <p className="text-sm font-bold icon-orange dark:text-orange-400 font-mono">88.0% Trust Rating</p>
          </div>
          <TrustScore score={88.0} />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 border-b border-[var(--border)] dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveQueueTab("queue")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeQueueTab === "queue" ? "btn-glass-orange-solid" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Pending Verification Queue ({queueCases.length})
        </button>
        <button
          onClick={() => setActiveQueueTab("history")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeQueueTab === "history" ? "btn-glass-orange-solid" : "text-slate-400 hover:text-white"
          }`}
        >
          Verification Audit Trail ({history.length})
        </button>
      </div>

      {/* Main Queue View */}
      <div className="max-w-7xl mx-auto">
        {activeQueueTab === "queue" ? (
          queueCases.length === 0 ? (
            <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 icon-orange dark:text-orange-400 mx-auto" />
              <h3 className="text-base card-heading dark:text-white">Queue Caught Up!</h3>
              <p className="text-xs body-text dark:text-slate-400">All nearby community reports have been verified.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {queueCases.map((item) => (
                <div
                  key={item.id}
                  className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center shadow-xl"
                >
                  {/* Photo & Priority */}
                  <div className="relative h-48 rounded-2xl overflow-hidden card-light dark:bg-slate-950">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded card-light dark:bg-slate-950/80 backdrop-blur-md text-[10px] font-mono card-heading dark:text-white font-bold">
                        {item.distance}
                      </span>
                    </div>
                  </div>

                  {/* Information Details */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-orange-400 font-bold">{item.caseNumber}</span>
                      <PriorityIndicator score={item.priorityScore} />
                    </div>

                    <h3 className="text-lg card-heading dark:text-white">{item.title}</h3>
                    <p className="text-xs body-text dark:text-slate-400 leading-relaxed">{item.description}</p>

                    {item.aiDuplicateNotice && (
                      <div className="p-2.5 rounded-xl card-light dark:bg-amber-950/50 dark:border-amber-800/80 text-[11px] icon-orange dark:text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{item.aiDuplicateNotice}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-xs border-t border-[var(--border)] dark:border-slate-800">
                      <span className="body-text dark:text-slate-400">
                        Confirmations: <strong className="card-heading dark:text-white">{item.currentConfirmations}/{item.threshold}</strong>
                      </span>
                      <span className="text-slate-400">Reporter Trust: {item.reporterTrust}%</span>
                    </div>

                    {/* Action Bar */}
                    <div className="grid grid-cols-3 gap-3 pt-3">
                      <button
                        onClick={() => handleDecision(item.id, "CONFIRM")}
                        className="btn-glass-orange-solid py-2 px-4 text-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Report</span>
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, "DISPUTE")}
                        className="py-2 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Dispute</span>
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, "SKIP")}
                        className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <SkipForward className="w-4 h-4" />
                        <span>Skip</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm card-heading dark:text-white">Past Verification Decisions</h3>
            <div className="space-y-2">
              {history.map((h, idx) => (
                <div key={idx} className="p-3 rounded-xl card-light dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono icon-orange dark:text-orange-400 font-bold mr-2">{h.caseNumber}</span>
                    <span className="card-heading dark:text-white font-medium">{h.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-300 text-[10px] font-bold">
                    {h.decision}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
