"use client";

import React, { useState } from "react";
import { Building, HeartHandshake, CheckCircle2, DollarSign, Users, Package, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSharedIssues } from "@/lib/report-sync";
import { ReportPhotoGallery } from "@/components/shared/ReportPhotoGallery";

export default function NgoDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const sharedIssues = useSharedIssues();
  const [dbReports, setDbReports] = useState<any[]>([]);
  const [transparencyReports, setTransparencyReports] = useState<any[]>([]);

  // Deduplicate sharedIssues with useMemo to prevent infinite loop
  const uniqueSharedIssues = React.useMemo(
    () => Array.from(new Map(sharedIssues.map((issue) => [issue.id, issue])).values()),
    [sharedIssues]
  );

  React.useEffect(() => {
    fetch("/api/reports/dashboard")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setDbReports(Array.from(new Map((data.data || []).map((r: any) => [r.id, r])).values()));
      })
      .catch(() => setDbReports([]));

    // Fetch all reports for map (like transparency page)
    fetch("/api/transparency")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setTransparencyReports(Array.from(new Map((data.cases || []).map((r: any) => [r.id, r])).values()));
      })
      .catch(() => setTransparencyReports([]));

    // Fetch assignments
    fetch("/api/assignments")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setAssignments(data.data || []);
      })
      .catch(() => setAssignments([]));

    // Fetch pledges
    fetch("/api/pledges")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setCommitments(data.data || []);
      })
      .catch(() => setCommitments([]));
  }, []);

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  React.useEffect(() => {
    const dbOpportunities = dbReports
      .filter((report) => ["SUBMITTED", "UNDER_VERIFICATION", "VERIFIED"].includes(report.status))
      .map((report) => ({
        id: report.id,
        caseNumber: report.caseNumber,
        title: report.title,
        description: report.description,
        category: report.category,
        priorityScore: report.priorityScore,
        address: report.address,
        imageUrl: report.imageUrl,
        photos: report.photos,
        supportNeeded: "Volunteer mobilization and on-ground support required",
      }));

    // Only show database reports for pledging (shared issues may not exist in DB)
    setOpportunities(dbOpportunities);
  }, [dbReports]);

  const [commitments, setCommitments] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [decisionNote, setDecisionNote] = useState("");

  const [pledgingCase, setPledgingCase] = useState<any | null>(null);
  const [pledgeType, setPledgeType] = useState("VOLUNTEERS");
  const [pledgeDesc, setPledgeDesc] = useState("");
  const [amountLkr, setAmountLkr] = useState("50000");

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgingCase) return;

    try {
      const response = await fetch("/api/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: pledgingCase.id,
          pledgeType,
          description: pledgeDesc,
          amountLkr: pledgeType === "FUNDING" ? parseInt(amountLkr) : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Pledge failed:", result.error);
        return;
      }

      // Refresh pledges
      fetch("/api/pledges")
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setCommitments(data.data || []);
          }
        })
        .catch(() => {});

      setPledgingCase(null);
      setPledgeDesc("");
    } catch (error) {
      console.error("Pledge submission error:", error);
    }
  };

  const handleReportDecision = async (reportId: string, newStatus: string) => {
    // Verify the report exists in the database before attempting to update
    const reportExists = dbReports.some((r) => r.id === reportId);
    if (!reportExists) {
      console.error("Cannot update: Report not found in database");
      alert("Cannot update: Report not found in database");
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Decision failed:", result.error);
        alert(`Decision failed: ${result.error || "Unknown error"}`);
        return;
      }

      setDbReports(dbReports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      setSelectedReport(null);
      setDecisionNote("");
    } catch (error) {
      console.error("Failed to update report status:", error);
      alert("Failed to update report status: Network error");
    }
  };

  const filteredReports = React.useMemo(() => {
    // Filter database reports directly
    return dbReports.filter((report) => {
      const statusMatch = filterStatus === "ALL" || report.status === filterStatus;
      const categoryMatch = filterCategory === "ALL" || report.category === filterCategory;
      return statusMatch && categoryMatch;
    });
  }, [dbReports, filterStatus, filterCategory]);

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
          <div className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-center">
            <span className="text-[10px] card-subtext dark:text-slate-500 font-medium block">Assigned Tasks</span>
            <span className="text-lg card-stat dark:text-orange-400 font-mono">{assignments.filter(a => a.status === "IN_PROGRESS").length}</span>
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
          markers={Array.from(
            new Map(
              transparencyReports.map((item) => [
                item.id,
                {
                  id: item.id,
                  title: item.title,
                  category: item.category,
                  status: item.status || "SUBMITTED",
                  latitude: item.latitude || (item.category === "ROADS" ? 6.8905 : item.category === "DRAINAGE" ? 6.9344 : 7.2625),
                  longitude: item.longitude || (item.category === "ROADS" ? 79.855 : item.category === "DRAINAGE" ? 79.8519 : 80.5972),
                  address: item.address,
                },
              ])
            ).values()
          )}
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
              <ReportPhotoGallery title={opp.title} photos={opp.photos} imageUrl={opp.imageUrl} maxItems={1} />
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
                <span className="font-mono icon-orange dark:text-teal-400 font-bold mr-2">{c.report?.referenceNo}</span>
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

      {/* All Reports Section with Decision Making */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg page-title dark:text-white">All Reports - Decision Making</h2>
          <span className="text-xs body-text dark:text-slate-400 font-mono">{filteredReports.length} reports</span>
        </div>

        {/* Filters */}
        <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold card-heading dark:text-slate-300">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="card-light dark:bg-slate-950 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs card-heading dark:text-white focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold card-heading dark:text-slate-300">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="card-light dark:bg-slate-950 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs card-heading dark:text-white focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Categories</option>
              <option value="ROADS">Roads</option>
              <option value="DRAINAGE">Drainage</option>
              <option value="WATER">Water</option>
              <option value="STREETLIGHTS">Streetlights</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base card-heading dark:text-white">No Reports Found</h3>
            <p className="text-xs body-text dark:text-slate-400">No reports match the current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-400">{report.referenceNo || report.caseNumber}</span>
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                  <PriorityIndicator score={report.priorityScore || 50} />
                </div>

                <div>
                  <h3 className="text-base card-heading dark:text-white">{report.title}</h3>
                  <p className="text-xs body-text dark:text-slate-400 mt-1">{report.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs body-text dark:text-slate-400">{report.address}</span>
                    <span className="text-xs body-text dark:text-slate-400">• {report.category}</span>
                  </div>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold"
                  >
                    Make Decision
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Tasks Tracking */}
      <div className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-lg page-title dark:text-white">Assigned Tasks Tracking</h2>
        {assignments.length === 0 ? (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base card-heading dark:text-white">No Assigned Tasks</h3>
            <p className="text-xs body-text dark:text-slate-400">Assigned tasks from DS officers will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-400">{assignment.report?.referenceNo}</span>
                    <StatusBadge status={assignment.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {assignment.acceptedAt && (
                      <span>Accepted: {new Date(assignment.acceptedAt).toLocaleDateString()}</span>
                    )}
                    {assignment.deadline && (
                      <span className={new Date(assignment.deadline) < new Date() ? "text-rose-400" : ""}>
                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base card-heading dark:text-white">{assignment.report?.title}</h3>
                  <p className="text-xs body-text dark:text-slate-400 mt-1">{assignment.report?.address}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-teal-400" />
                      <span className="text-xs card-heading dark:text-white">Assigned by DS Officer</span>
                    </div>
                  </div>
                  {assignment.inspections && assignment.inspections.length > 0 && (
                    <span className="text-xs text-emerald-400">{assignment.inspections.length} inspection(s)</span>
                  )}
                </div>

                {assignment.notes && (
                  <div className="p-3 rounded-xl card-light dark:bg-slate-950 dark:border-slate-800 text-xs body-text dark:text-slate-400">
                    <span className="font-bold card-heading dark:text-slate-300">Notes: </span>
                    {assignment.notes}
                  </div>
                )}

                {assignment.status === "PENDING" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        fetch("/api/assignments", {
                          method: "PATCH",
                          body: JSON.stringify({ id: assignment.id, status: "ACCEPTED" }),
                        })
                          .then(() => {
                            setAssignments(assignments.map(a =>
                              a.id === assignment.id ? { ...a, status: "ACCEPTED", acceptedAt: new Date() } : a
                            ));
                          });
                      }}
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept Task
                    </button>
                    <button
                      onClick={() => {
                        fetch("/api/assignments", {
                          method: "PATCH",
                          body: JSON.stringify({ id: assignment.id, status: "DECLINED" }),
                        })
                          .then(() => {
                            setAssignments(assignments.filter(a => a.id !== assignment.id));
                          });
                      }}
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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

      {/* Report Decision Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <span className="font-mono icon-orange dark:text-teal-400 font-bold">{selectedReport.referenceNo || selectedReport.caseNumber}</span>
              <h3 className="text-lg card-heading dark:text-white">Make Decision on Report</h3>
            </div>

            <div className="p-3 rounded-2xl card-light dark:bg-slate-950 dark:border-slate-800 text-xs">
              <h4 className="font-bold card-heading dark:text-white text-sm">{selectedReport.title}</h4>
              <ReportPhotoGallery title={selectedReport.title} photos={selectedReport.photos} imageUrl={selectedReport.imageUrl} />
              <p className="body-text dark:text-slate-400 mt-1">{selectedReport.description}</p>
              <p className="text-slate-500 mt-2">{selectedReport.address}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={selectedReport.status} size="sm" />
                <span className="body-text dark:text-slate-400">{selectedReport.category}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                Decision Note (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add notes about your decision..."
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                className="w-full card-light dark:bg-slate-950 dark:border-slate-800 rounded-xl p-3 text-xs card-heading dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Action
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleReportDecision(selectedReport.id, "VERIFIED")}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Mark as Verified
                </button>
                <button
                  onClick={() => handleReportDecision(selectedReport.id, "IN_PROGRESS")}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                >
                  Mark as In Progress
                </button>
                <button
                  onClick={() => handleReportDecision(selectedReport.id, "RESOLVED")}
                  className="px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold"
                >
                  Mark as Resolved
                </button>
                <button
                  onClick={() => handleReportDecision(selectedReport.id, "SUBMITTED")}
                  className="px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl text-xs font-bold"
                >
                  Return to Submitted
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setDecisionNote("");
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
