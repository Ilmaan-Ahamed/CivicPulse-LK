"use client";

import React, { useState } from "react";
import { Landmark, Building2, Cpu, AlertTriangle, ShieldCheck, CheckCircle2, UserCheck, ArrowRight, X, Sparkles } from "lucide-react";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CaseTimeline } from "@/components/shared/CaseTimeline";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSharedIssues } from "@/lib/report-sync";

export default function DsOfficerConsole() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const sharedIssues = useSharedIssues();

  const [triageCases, setTriageCases] = useState([
    {
      id: "case-1042",
      caseNumber: "CP-2026-1042",
      title: "Hazardous Deep Potholes near Bambalapitiya Junction",
      description: "Severe road surface damage causing vehicle accidents and traffic congestion on A2 main corridor near Galle Road Bamba junction.",
      category: "ROADS",
      status: "VERIFIED",
      priorityScore: 88.5,
      aiSummary: "High-priority urban arterial road hazard near major public transit junction. Immediate asphalt resurfacing recommended.",
      address: "Galle Road, Bambalapitiya, Colombo 04",
      verificationCount: 4,
      age: "2 days old",
      slaBreachRisk: true,
    },
    {
      id: "case-1046",
      caseNumber: "CP-2026-1046",
      title: "Collapsed Drainage Retaining Wall in Nugegoda",
      description: "Heavy rain damaged 8m segment of concrete canal wall near high street market.",
      category: "DRAINAGE",
      status: "VERIFIED",
      priorityScore: 81.0,
      aiSummary: "Drainage wall collapse risking flash floods in nearby commercial market stalls.",
      address: "High Level Road, Nugegoda",
      verificationCount: 3,
      age: "1 day old",
      slaBreachRisk: false,
    },
  ]);

  React.useEffect(() => {
    const syncedQueue = sharedIssues
      .filter((issue) => ["SUBMITTED", "UNDER_VERIFICATION", "VERIFIED"].includes(issue.status))
      .map((issue) => ({
        id: issue.id,
        caseNumber: issue.caseNumber,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        status: issue.status,
        priorityScore: issue.priorityScore,
        aiSummary: `Citizen-submitted ${issue.category.toLowerCase()} issue. This report is now visible to the DS Office dashboard for triage.`,
        address: issue.address,
        verificationCount: 1,
        age: "Just submitted",
        slaBreachRisk: issue.priorityScore >= 80,
      }));

    setTriageCases((previous) => {
      const seen = new Set(previous.map((item) => item.caseNumber));
      const freshItems = syncedQueue.filter((item) => !seen.has(item.caseNumber));
      return [...freshItems, ...previous];
    });
  }, [sharedIssues]);

  const [assigningCase, setAssigningCase] = useState<any | null>(null);
  const [selectedAgency, setSelectedAgency] = useState("RDA Western Province");
  const [instructions, setInstructions] = useState("");
  const [assignedCasesCount, setAssignedCasesCount] = useState(14);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningCase) return;

    setTriageCases(triageCases.filter((c) => c.id !== assigningCase.id));
    setAssignedCasesCount(assignedCasesCount + 1);
    setAssigningCase(null);
    setInstructions("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* DS Console Header */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 icon-orange dark:text-orange-400" />
            <h1 className="text-2xl page-title dark:text-white">{t("dash.ds.title")}</h1>
          </div>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            {currentUser.organization} • Central Operational Routing & AI Priority Triage Hub
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-center">
            <span className="text-[10px] card-subtext dark:text-slate-500 font-medium block">Unassigned Triage</span>
            <span className="text-lg card-stat dark:text-amber-400 font-mono">{triageCases.length}</span>
          </div>
          <div className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-center">
            <span className="text-[10px] card-subtext dark:text-slate-500 font-medium block">Assigned Active</span>
            <span className="text-lg card-stat dark:text-orange-400 font-mono">{assignedCasesCount}</span>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] card-subtext dark:text-slate-500 font-medium">Average Triage SLA</span>
          <p className="text-xl card-stat dark:text-white font-mono mt-1">1.4 Hours</p>
        </div>
        <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] card-subtext dark:text-slate-500 font-medium">SLA Risk Warnings</span>
          <p className="text-xl card-stat dark:text-rose-400 font-mono mt-1">1 Case Alert</p>
        </div>
        <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] card-subtext dark:text-slate-500 font-medium">Active Agencies</span>
          <p className="text-xl card-stat dark:text-orange-400 font-mono mt-1">6 Partner Agencies</p>
        </div>
        <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] card-subtext dark:text-slate-500 font-medium">AI Accuracy Rate</span>
          <p className="text-xl card-stat dark:text-teal-400 font-mono mt-1">94.8% Advisory</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base card-heading dark:text-white">MapCN.dev geospatial queue</h2>
            <p className="text-[11px] body-text dark:text-slate-400">Submitted issues are synced to the DS Office map in near real time.</p>
          </div>
          <span className="text-[10px] font-mono text-amber-400">{[...triageCases, ...sharedIssues].length} mapped alerts</span>
        </div>
        <InteractiveMap
          markers={[
            ...sharedIssues.map((issue) => ({
              id: issue.id,
              title: issue.title,
              category: issue.category,
              status: issue.status,
              latitude: issue.category === "ROADS" ? 6.8905 : issue.category === "DRAINAGE" ? 6.9344 : 7.2625,
              longitude: issue.category === "ROADS" ? 79.855 : issue.category === "DRAINAGE" ? 79.8519 : 80.5972,
              address: issue.address,
            })),
            ...triageCases.map((item) => ({
              id: item.id,
              title: item.title,
              category: item.category,
              status: item.status,
              latitude: item.category === "ROADS" ? 6.8905 : item.category === "DRAINAGE" ? 6.9344 : 7.2625,
              longitude: item.category === "ROADS" ? 79.855 : item.category === "DRAINAGE" ? 79.8519 : 80.5972,
              address: item.address,
            })),
          ]}
          center={[6.9271, 79.8612]}
          zoom={11}
        />
      </div>

      {/* Triage Queue Worklist */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg page-title dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 icon-orange dark:text-amber-400" />
            <span>Verified Unassigned Triage Queue</span>
          </h2>
          <span className="text-xs body-text dark:text-slate-400 font-mono">Sorted by AI Priority Score</span>
        </div>

        {triageCases.length === 0 ? (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 icon-orange dark:text-orange-400 mx-auto" />
            <h3 className="text-base card-heading dark:text-white">Triage Queue Cleared!</h3>
            <p className="text-xs body-text dark:text-slate-400">All verified infrastructure cases have been assigned to target agencies.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {triageCases.map((item) => (
              <div
                key={item.id}
                className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-400">{item.caseNumber}</span>
                    <StatusBadge status={item.status} size="sm" />
                    {item.slaBreachRisk && (
                      <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 text-[10px] font-bold border border-rose-800 animate-pulse">
                        SLA Risk
                      </span>
                    )}
                  </div>
                  <PriorityIndicator score={item.priorityScore} />
                </div>

                <div>
                  <h3 className="text-base card-heading dark:text-white">{item.title}</h3>
                  <p className="text-xs body-text dark:text-slate-400 mt-1">{item.description}</p>
                </div>

                {/* AI Advisory Summary Box */}
                <div className="p-3 rounded-2xl card-light dark:bg-slate-950 dark:border-slate-800/80 flex items-start gap-2 text-xs body-text dark:text-slate-300">
                  <Cpu className="w-4 h-4 icon-orange dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold icon-orange dark:text-orange-300">AI Advisory Summary: </span>
                    <span>{item.aiSummary}</span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-border dark:border-slate-800">
                  <span className="text-xs body-text dark:text-slate-400">{item.address} • {item.verificationCount} Verifications</span>

                  <button
                    onClick={() => setAssigningCase(item)}
                    className="btn-glass-orange-solid px-5 py-2 text-xs flex items-center gap-1.5"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Assign Agency</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agency Assignment Modal */}
      {assigningCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAssignSubmit}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Assign Responsible Agency</h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningCase(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <span className="font-mono text-orange-400 font-bold">{assigningCase.caseNumber}</span>
              <h4 className="font-bold text-white text-sm mt-0.5">{assigningCase.title}</h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Responsible Government Agency
              </label>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="RDA Western Province">Road Development Authority (RDA Western Province)</option>
                <option value="NWSDB Colombo">National Water Supply & Drainage Board (NWSDB)</option>
                <option value="Colombo Municipal Council">Colombo Municipal Council (CMC Maintenance)</option>
                <option value="CEB Western Division">Ceylon Electricity Board (CEB)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Routing Instructions & SLA Deadline Notes
              </label>
              <textarea
                rows={3}
                placeholder="Specify repair urgency, gully vacuum deployment, or traffic control notes..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssigningCase(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-glass-orange-solid px-6 py-2 text-xs"
              >
                Confirm Agency Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
