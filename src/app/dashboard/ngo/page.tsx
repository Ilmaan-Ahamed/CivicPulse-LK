"use client";

import React, { useState } from "react";
import { Building, HeartHandshake, CheckCircle2, DollarSign, Users, Package, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSharedIssues } from "@/lib/report-sync";

export default function NgoDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const sharedIssues = useSharedIssues();

  const [opportunities, setOpportunities] = useState([
    {
      id: "case-1043",
      caseNumber: "CP-2026-1043",
      title: "Blocked Main Canal Causing Pettah Market Flooding",
      description: "Polythene and debris blockages in the primary drainage channel adjacent to Central Bus Stand during heavy rains.",
      category: "DRAINAGE",
      priorityScore: 76.0,
      address: "Bodhiraja Mawatha, Pettah, Colombo 11",
      supportNeeded: "Volunteer cleaning crew & safety gear required",
    },
  ]);

  React.useEffect(() => {
    const syncedOpportunities = sharedIssues
      .filter((issue) => ["SUBMITTED", "UNDER_VERIFICATION", "VERIFIED"].includes(issue.status))
      .map((issue) => ({
        id: issue.id,
        caseNumber: issue.caseNumber,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        priorityScore: issue.priorityScore,
        address: issue.address,
        supportNeeded: "Volunteer mobilization and on-ground support required",
      }));

    setOpportunities((previous) => {
      const seen = new Set(previous.map((item) => item.caseNumber));
      const freshItems = syncedOpportunities.filter((item) => !seen.has(item.caseNumber));
      return [...freshItems, ...previous];
    });
  }, [sharedIssues]);

  const [commitments, setCommitments] = useState([
    {
      id: "pledge-01",
      caseNumber: "CP-2026-1043",
      pledgeType: "VOLUNTEERS & SAFETY GEAR",
      description: "Pledged 15 volunteer team members for community canal cleanup and trash removal.",
      status: "PLEDGED & ACTIVE",
    },
  ]);

  const [pledgingCase, setPledgingCase] = useState<any | null>(null);
  const [pledgeType, setPledgeType] = useState("VOLUNTEERS");
  const [pledgeDesc, setPledgeDesc] = useState("");
  const [amountLkr, setAmountLkr] = useState("50000");

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgingCase) return;

    setCommitments([
      {
        id: `pledge-${Date.now()}`,
        caseNumber: pledgingCase.caseNumber,
        pledgeType: pledgeType,
        description: pledgeDesc || `Pledged ${pledgeType} support to case ${pledgingCase.caseNumber}`,
        status: "PLEDGED & ACTIVE",
      },
      ...commitments,
    ]);

    setPledgingCase(null);
    setPledgeDesc("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 icon-orange dark:text-teal-400" />
            <h1 className="text-2xl page-title dark:text-white">{t("dash.ngo.title")}</h1>
          </div>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            {currentUser.organization || "Rotary Community Sri Lanka"} • Civic Partnership & Impact Hub
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-center">
            <span className="text-[10px] card-subtext dark:text-slate-500 font-medium block">Active Commitments</span>
            <span className="text-lg card-stat dark:text-teal-400 font-mono">{commitments.length}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base card-heading dark:text-white">MapCN.dev support map</h2>
            <p className="text-[11px] body-text dark:text-slate-400">All newly reported issues visible to NGO partners for coordination and mobilization.</p>
          </div>
          <span className="text-[10px] font-mono text-teal-400">{opportunities.length} opportunities</span>
        </div>
        <InteractiveMap
          markers={opportunities.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            status: "SUBMITTED",
            latitude: item.category === "ROADS" ? 6.8905 : item.category === "DRAINAGE" ? 6.9344 : 7.2625,
            longitude: item.category === "ROADS" ? 79.855 : item.category === "DRAINAGE" ? 79.8519 : 80.5972,
            address: item.address,
          }))}
          center={[6.9271, 79.8612]}
          zoom={11}
        />
      </div>

      {/* Opportunity Board */}
      <div className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-lg page-title dark:text-white">Verified Infrastructure Cases Needing Support</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div key={opp.id} className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-400">{opp.caseNumber}</span>
                <PriorityIndicator score={opp.priorityScore} />
              </div>

              <div>
                <h3 className="text-base card-heading dark:text-white">{opp.title}</h3>
                <p className="text-xs body-text dark:text-slate-400 mt-1">{opp.description}</p>
              </div>

              <div className="p-3 rounded-2xl card-light dark:bg-teal-950/40 dark:border-teal-800/60 text-xs icon-orange dark:text-teal-300">
                <span className="font-bold">Support Requirement: </span>
                <span>{opp.supportNeeded}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border dark:border-slate-800">
                <span className="text-xs body-text dark:text-slate-400">{opp.address}</span>
                <button
                  onClick={() => setPledgingCase(opp)}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Pledge Support</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pledged Commitments Tracker */}
      <div className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-lg page-title dark:text-white">NGO Active Commitments</h2>
        <div className="space-y-3">
          {commitments.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl card-light dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono icon-orange dark:text-teal-400 font-bold mr-2">{c.caseNumber}</span>
                <span className="card-heading dark:text-white font-bold">{c.pledgeType}: </span>
                <span className="body-text dark:text-slate-300">{c.description}</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-teal-950 text-teal-300 font-bold text-[10px]">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pledge Support Modal */}
      {pledgingCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handlePledgeSubmit}
            className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl"
          >
            <div className="border-b border-slate-800 pb-3">
              <span className="font-mono icon-orange dark:text-teal-400 font-bold">{pledgingCase.caseNumber}</span>
              <h3 className="text-lg card-heading dark:text-white">Pledge NGO Support & Contribution</h3>
            </div>

            <div>
              <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                Pledge Category
              </label>
              <select
                value={pledgeType}
                onChange={(e) => setPledgeType(e.target.value)}
                className="w-full card-light dark:bg-slate-950 dark:border-slate-800 rounded-xl px-4 py-3 text-xs card-heading dark:text-white focus:outline-none focus:border-teal-500"
              >
                <option value="VOLUNTEERS">Volunteers & Field Team</option>
                <option value="FUNDING">Co-Funding (LKR)</option>
                <option value="MATERIALS">Construction Materials & Equipment</option>
                <option value="TECHNICAL_SUPPORT">Technical Engineering Expertise</option>
              </select>
            </div>

            {pledgeType === "FUNDING" && (
              <div>
                <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                  Funding Amount (LKR)
                </label>
                <input
                  type="number"
                  value={amountLkr}
                  onChange={(e) => setAmountLkr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                Pledge Description & Resource Notes
              </label>
              <textarea
                rows={3}
                required
                placeholder="Specify volunteer team count, material quantities, or co-funding details..."
                value={pledgeDesc}
                onChange={(e) => setPledgeDesc(e.target.value)}
                className="w-full card-light dark:bg-slate-950 dark:border-slate-800 rounded-xl p-3 text-xs card-heading dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPledgingCase(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-teal-600/30"
              >
                Confirm NGO Commitment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
