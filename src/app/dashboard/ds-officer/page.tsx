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
  const [dbReports, setDbReports] = useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/reports/dashboard")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setDbReports(data.data || []);
      })
      .catch(() => setDbReports([]));
  }, []);

  const [triageCases, setTriageCases] = useState<any[]>([]);

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

    const dbQueue = dbReports
      .filter((report) => ["SUBMITTED", "UNDER_VERIFICATION", "VERIFIED"].includes(report.status))
      .map((report) => ({
        id: report.id,
        caseNumber: report.caseNumber,
        title: report.title,
        description: report.description,
        category: report.category,
        status: report.status,
        priorityScore: report.priorityScore,
        aiSummary: `Citizen-submitted ${report.category.toLowerCase()} issue. This report is now visible to the DS Office dashboard for triage.`,
        address: report.address,
        verificationCount: report.verificationCount || 0,
        age: "Just submitted",
        slaBreachRisk: report.priorityScore >= 80,
      }));

    setTriageCases([...dbQueue, ...syncedQueue]);
  }, [sharedIssues, dbReports]);

  const [assigningCase, setAssigningCase] = useState<any | null>(null);
  const [selectedAgency, setSelectedAgency] = useState("RDA Western Province");
  const [instructions, setInstructions] = useState("");
  const [assignedCasesCount, setAssignedCasesCount] = useState(0);

  // Calculate statistics from real data
  const stats = React.useMemo(() => {
    const totalReports = dbReports.length;
    const verifiedReports = dbReports.filter(r => r.status === "VERIFIED").length;
    const resolvedReports = dbReports.filter(r => r.status === "RESOLVED").length;
    const highPriorityReports = dbReports.filter(r => r.priorityScore >= 80).length;
    
    const categoryCounts = dbReports.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const districtCounts = dbReports.reduce((acc, r) => {
      acc[r.district] = (acc[r.district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalReports,
      verifiedReports,
      resolvedReports,
      highPriorityReports,
      categoryCounts,
      districtCounts,
    };
  }, [dbReports]);

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
          <a
            href="/ds-console"
            className="btn-glass-orange-solid px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>DS Console</span>
          </a>
          <a
            href="/ds-console/agencies"
            className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-xs flex items-center gap-1.5 hover:border-orange-500 transition-colors"
          >
            <Building2 className="w-4 h-4 text-orange-400" />
            <span>Agencies</span>
          </a>
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
          <span className="text-[10px] card-subtext dark:text-slate-500 font-medium">Total Reports</span>
          <p className="text-xl card-stat dark:text-white font-mono mt-1">{stats.totalReports}</p>
        </div>
        <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] card-subtext dark:text-slate-500 font-medium">High Priority</span>
          <p className="text-xl card-stat dark:text-rose-400 font-mono mt-1">{stats.highPriorityReports}</p>
        </div>
        <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] card-subtext dark:text-slate-500 font-medium">Verified</span>
          <p className="text-xl card-stat dark:text-orange-400 font-mono mt-1">{stats.verifiedReports}</p>
        </div>
        <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] card-subtext dark:text-slate-500 font-medium">Resolved</span>
          <p className="text-xl card-stat dark:text-teal-400 font-mono mt-1">{stats.resolvedReports}</p>
        </div>
      </div>

      {/* Chart Dashboard Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Reports by Category Chart */}
        <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 space-y-4">
          <h4 className="text-sm font-bold card-heading dark:text-white">Reports by Category</h4>
          <div className="space-y-3">
            {Object.entries(stats.categoryCounts).map(([category, count]) => {
              const percentage = stats.totalReports > 0 ? Math.round((count / stats.totalReports) * 100) : 0;
              const colors: Record<string, string> = {
                ROADS: "icon-orange",
                DRAINAGE: "text-blue-400",
                WATER: "text-cyan-400",
                STREETLIGHTS: "text-amber-400",
              };
              const bgColors: Record<string, string> = {
                ROADS: "bg-orange-500 dark:bg-orange-400",
                DRAINAGE: "bg-blue-500 dark:bg-blue-400",
                WATER: "bg-cyan-500 dark:bg-cyan-400",
                STREETLIGHTS: "bg-amber-500 dark:bg-amber-400",
              };
              return (
                <div key={category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="body-text dark:text-slate-400">{category}</span>
                    <span className={`font-mono ${colors[category] || "text-slate-400"}`}>{percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${bgColors[category] || "bg-slate-500"} rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.categoryCounts).length === 0 && (
              <p className="text-xs body-text dark:text-slate-400">No data available</p>
            )}
          </div>
        </div>

        {/* Resolution Status Chart */}
        <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 space-y-4">
          <h4 className="text-sm font-bold card-heading dark:text-white">Resolution Status</h4>
          <div className="space-y-3">
            {stats.totalReports > 0 ? (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="body-text dark:text-slate-400">Resolved</span>
                    <span className="font-mono text-emerald-400">{Math.round((stats.resolvedReports / stats.totalReports) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" style={{ width: `${(stats.resolvedReports / stats.totalReports) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="body-text dark:text-slate-400">Verified</span>
                    <span className="font-mono text-blue-400">{Math.round((stats.verifiedReports / stats.totalReports) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full" style={{ width: `${(stats.verifiedReports / stats.totalReports) * 100}%` }}></div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs body-text dark:text-slate-400">No data available</p>
            )}
          </div>
        </div>

        {/* Top Divisional Secretariats */}
        <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 space-y-4">
          <h4 className="text-sm font-bold card-heading dark:text-white">Top DS Divisions</h4>
          <div className="space-y-3">
            {Object.entries(stats.districtCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([district, count], index) => {
                const colors = ["icon-orange", "text-blue-400", "text-cyan-400", "text-amber-400", "text-purple-400"];
                return (
                  <div key={district} className="flex items-center justify-between">
                    <span className="text-xs body-text dark:text-slate-400">{district}</span>
                    <span className={`text-xs font-mono ${colors[index] || "text-slate-400"} font-bold`}>{count}</span>
                  </div>
                );
              })}
            {Object.keys(stats.districtCounts).length === 0 && (
              <p className="text-xs body-text dark:text-slate-400">No data available</p>
            )}
          </div>
        </div>

        {/* Weekly Trend - Placeholder */}
        <div className="card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 space-y-4">
          <h4 className="text-sm font-bold card-heading dark:text-white">Weekly Trend</h4>
          <div className="flex items-end justify-between h-24 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div key={day} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-orange-500 dark:bg-orange-400 rounded-t" style={{ height: `${30 + Math.random() * 60}%` }}></div>
                <span className="text-[10px] body-text dark:text-slate-400">{day}</span>
              </div>
            ))}
          </div>
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
