"use client";

import React, { useState } from "react";
import { Building2, Wrench, CheckCircle2, AlertTriangle, Camera, Upload, Send, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AgencyWorkstation() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [assignedCases, setAssignedCases] = useState([
    {
      id: "case-1043",
      caseNumber: "CP-2026-1043",
      title: "Blocked Main Canal Causing Pettah Market Flooding",
      description: "Polythene and debris blockages in the primary drainage channel adjacent to Central Bus Stand during heavy rains.",
      category: "DRAINAGE",
      status: "IN_PROGRESS",
      priorityScore: 76.0,
      instructions: "Deploy RDA gully vacuum and drainage clearing squad immediately.",
      address: "Bodhiraja Mawatha, Pettah, Colombo 11",
      assignedAt: "Aug 12, 2026",
    },
  ]);

  const [completedCases, setCompletedCases] = useState([
    {
      id: "case-1045",
      caseNumber: "CP-2026-1045",
      title: "Burst Main Water Pipe at Galle Fort Pedestrian Walkway",
      status: "RESOLVED",
      resolutionNotes: "NWSDB emergency crew replaced damaged 110mm PVC line and restored cobblestones on 12th Aug 2026.",
      resolvedAt: "Aug 12, 2026",
    },
  ]);

  const [repairModalCase, setRepairModalCase] = useState<any | null>(null);
  const [repairNotes, setRepairNotes] = useState("");
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"
  );
  const [blockerReason, setBlockerReason] = useState("");
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);

  const handleMarkCompleted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairModalCase) return;

    setAssignedCases(assignedCases.filter((c) => c.id !== repairModalCase.id));
    setCompletedCases([
      {
        id: repairModalCase.id,
        caseNumber: repairModalCase.caseNumber,
        title: repairModalCase.title,
        status: "RESOLVED",
        resolutionNotes: repairNotes || "Repair completed and verified by RDA agency field crew.",
        resolvedAt: "Just now",
      },
      ...completedCases,
    ]);

    setRepairModalCase(null);
    setRepairNotes("");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* Agency Header Banner */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 icon-orange dark:text-amber-400" />
            <h1 className="text-2xl page-title dark:text-white">{t("dash.agency.title")}</h1>
          </div>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            {currentUser.organization} • Infrastructure Repair & Accountability Workspace
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-center">
            <span className="text-[10px] card-subtext dark:text-slate-500 font-medium block">Active Assigned Work</span>
            <span className="text-lg card-stat dark:text-amber-400 font-mono">{assignedCases.length}</span>
          </div>
          <div className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-center">
            <span className="text-[10px] card-subtext dark:text-slate-500 font-medium block">Completed Repairs</span>
            <span className="text-lg card-stat dark:text-emerald-400 font-mono">{completedCases.length}</span>
          </div>
        </div>
      </div>

      {/* Active Worklist */}
      <div className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-lg page-title dark:text-white">Assigned Actionable Worklist</h2>

        {assignedCases.length === 0 ? (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base card-heading dark:text-white">No Pending Worklist Items</h3>
            <p className="text-xs body-text dark:text-slate-400">All assigned repair work has been completed and published.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedCases.map((item) => (
              <div key={item.id} className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">{item.caseNumber}</span>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <div>
                  <h3 className="text-base card-heading dark:text-white">{item.title}</h3>
                  <p className="text-xs body-text dark:text-slate-400 mt-1">{item.description}</p>
                </div>

                <div className="p-3 rounded-2xl card-light dark:bg-slate-950 dark:border-slate-800 text-xs body-text dark:text-slate-300">
                  <span className="font-bold text-indigo-400">DS Officer Instructions: </span>
                  <span>{item.instructions}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--border)] dark:border-slate-800">
                  <span className="text-xs body-text dark:text-slate-400">{item.address}</span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsBlockerModalOpen(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Report Blocker</span>
                    </button>

                    <button
                      onClick={() => setRepairModalCase(item)}
                      className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Mark Work Completed</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {repairModalCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleMarkCompleted}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl"
          >
            <div className="border-b border-slate-800 pb-3">
              <span className="font-mono text-xs text-emerald-400 font-bold">{repairModalCase.caseNumber}</span>
              <h3 className="text-lg font-bold text-white">Upload Repair Evidence & Resolve</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Field Repair Notes & Resolution Details
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe equipment deployed, replacement parts, or road resurfacing completed..."
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                After Repair Photo Evidence
              </span>
              <div className="h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <img src={afterPhotoUrl} alt="After Evidence" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRepairModalCase(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30"
              >
                Publish Resolution
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
