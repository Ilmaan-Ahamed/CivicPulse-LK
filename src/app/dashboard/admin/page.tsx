"use client";

import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSharedIssues } from "@/lib/report-sync";

export default function AdminConsole() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const sharedIssues = useSharedIssues();
  const [activeAdminTab, setActiveAdminTab] = useState<"users" | "role-requests" | "settings" | "audit">("users");
  const [inspectingIssueId, setInspectingIssueId] = useState<string | null>(null);
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

  const [users, setUsers] = useState<any[]>([]);
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [verificationThreshold, setVerificationThreshold] = useState("3");
  const [autoAiEnabled, setAutoAiEnabled] = useState(true);

  // Calculate statistics from real data
  const stats = React.useMemo(() => {
    const totalReports = dbReports.length;
    const verifiedReports = dbReports.filter(r => r.status === "VERIFIED").length;
    const resolvedReports = dbReports.filter(r => r.status === "RESOLVED").length;
    const inProgressReports = dbReports.filter(r => r.status === "IN_PROGRESS").length;
    
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
      inProgressReports,
      categoryCounts,
      districtCounts,
    };
  }, [dbReports]);

  React.useEffect(() => {
    // Fetch users from database
    fetch("/api/users")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setUsers(data.data || []);
      })
      .catch(() => setUsers([]));

    // Fetch audit logs from database
    fetch("/api/audit-logs")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setAuditLogs(data.data || []);
      })
      .catch(() => setAuditLogs([]));
  }, []);

  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : u))
    );
  };

  const handleRoleApprove = (id: string) => {
    setRoleRequests(roleRequests.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-300">
      {/* Admin Header Banner */}
      <div className="max-w-7xl mx-auto card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 icon-orange dark:text-rose-400" />
            <h1 className="text-2xl page-title dark:text-white">{t("dash.admin.title")}</h1>
          </div>
          <p className="text-xs body-text dark:text-[#B0B0B0]">
            Signed in as {currentUser.name} • CivicPulse LK System Administration • Security, RBAC Enforcement & Immutable Audit Logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="card-light dark:bg-slate-950 dark:border-slate-800 px-4 py-2 rounded-2xl border text-center">
            <span className="text-[10px] card-subtext dark:text-slate-500 font-medium block">Total Platform Users</span>
            <span className="text-lg card-stat dark:text-white font-mono">{users.length}</span>
          </div>
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
                    <span className="body-text dark:text-slate-400">In Progress</span>
                    <span className="font-mono text-blue-400">{Math.round((stats.inProgressReports / stats.totalReports) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full" style={{ width: `${(stats.inProgressReports / stats.totalReports) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="body-text dark:text-slate-400">Verified</span>
                    <span className="font-mono text-amber-400">{Math.round((stats.verifiedReports / stats.totalReports) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 dark:bg-amber-400 rounded-full" style={{ width: `${(stats.verifiedReports / stats.totalReports) * 100}%` }}></div>
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

      <div className="max-w-7xl mx-auto card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base card-heading dark:text-white">Platform Report Map</h3>
          <span className="text-[10px] font-mono text-rose-400">{[...sharedIssues, ...dbReports].length} total reports</span>
        </div>
        <InteractiveMap
          markers={[
            ...sharedIssues.map((issue) => ({
              id: issue.id,
              caseId: issue.caseNumber,
              title: issue.title,
              category: issue.category,
              status: issue.status,
              latitude: issue.category === "ROADS" ? 6.8905 : issue.category === "DRAINAGE" ? 6.9344 : issue.category === "WATER" ? 6.0268 : 7.2625,
              longitude: issue.category === "ROADS" ? 79.855 : issue.category === "DRAINAGE" ? 79.8519 : issue.category === "WATER" ? 80.217 : 80.5972,
              address: issue.address,
            })),
            ...dbReports.map((report) => ({
              id: report.id,
              caseId: report.caseNumber,
              title: report.title,
              category: report.category,
              status: report.status,
              latitude: report.latitude || 6.9271,
              longitude: report.longitude || 79.8612,
              address: report.address,
            })),
          ]}
          center={[6.9271, 79.8612]}
          zoom={11}
          onMarkerSelect={(marker) => setInspectingIssueId(marker.id)}
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dbReports.slice(0, 6).map((issue) => (
            <div key={issue.id} className="p-4 rounded-2xl card-light dark:bg-slate-950 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-mono text-[10px] text-rose-400 font-bold">{issue.caseNumber}</span>
                <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 text-[10px] font-bold border border-rose-800">
                  {issue.status}
                </span>
              </div>
              <h4 className="text-sm font-bold card-heading dark:text-white line-clamp-1">{issue.title}</h4>
              <p className="text-[11px] body-text dark:text-slate-400 mt-1 line-clamp-2">{issue.description}</p>
              <p className="text-[11px] body-text dark:text-slate-500 mt-2">{issue.address}</p>
            </div>
          ))}
        </div>
        {inspectingIssueId && (() => {
          const issue = dbReports.find((item) => item.id === inspectingIssueId);
          if (!issue) return null;

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-report-inspection-title"
              onClick={() => setInspectingIssueId(null)}
            >
              <div
                className="card-light dark:bg-slate-900 dark:border-slate-700 w-full max-w-lg rounded-3xl border p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-rose-400">{issue.caseNumber}</span>
                    <h2 id="admin-report-inspection-title" className="mt-2 text-xl font-bold card-heading dark:text-white">
                      {issue.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    aria-label="Close report inspection"
                    onClick={() => setInspectingIssueId(null)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 space-y-3 text-xs">
                  <p className="body-text dark:text-slate-300">{issue.description}</p>
                  <p className="text-slate-500">{issue.address}</p>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="rounded border border-rose-800 bg-rose-950/80 px-2 py-1 text-rose-300">{issue.status}</span>
                    <span className="text-slate-500">{issue.category}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Admin Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 border-b border-border dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveAdminTab("users")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeAdminTab === "users" ? "bg-[#F97316] dark:bg-rose-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveAdminTab("role-requests")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeAdminTab === "role-requests" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Role Upgrade Requests ({roleRequests.length})
        </button>

        <button
          onClick={() => setActiveAdminTab("settings")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeAdminTab === "settings" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Platform Settings
        </button>

        <button
          onClick={() => setActiveAdminTab("audit")}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            activeAdminTab === "audit" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Immutable Audit Logs
        </button>
      </div>

      {/* Main Admin Tab Views */}
      <div className="max-w-7xl mx-auto">
        {activeAdminTab === "users" && (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base card-heading dark:text-white">Registered Users & Role Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                    <th className="pb-3">User Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role Persona</th>
                    <th className="pb-3">Trust Rating</th>
                    <th className="pb-3">Account Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 font-bold card-heading dark:text-white">{u.name}</td>
                      <td className="py-3 body-text dark:text-slate-400">{u.email}</td>
                      <td className="py-3">
                        <RoleBadge role={u.role as "CITIZEN" | "NGO_PARTNER" | "DS_OFFICER" | "ADMIN"} />
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-400">{u.trustScore}%</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-rose-950 text-rose-300 border border-rose-800"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeAdminTab === "role-requests" && (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base card-heading dark:text-white">Elevated Role Upgrade Approvals</h3>
            {roleRequests.length === 0 ? (
              <p className="text-xs body-text dark:text-slate-400">No pending role requests.</p>
            ) : (
              <div className="space-y-3">
                {roleRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl card-light dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold card-heading dark:text-white">{req.name} ({req.email})</h4>
                      <p className="body-text dark:text-slate-400 mt-0.5">Requested Role: <strong className="text-emerald-400">{req.requestedRole}</strong></p>
                      <p className="text-slate-500 italic mt-1 font-mono">“{req.reason}”</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRoleApprove(req.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                      >
                        Approve Role
                      </button>
                      <button
                        onClick={() => handleRoleApprove(req.id)}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeAdminTab === "settings" && (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-6 max-w-xl">
            <h3 className="text-base card-heading dark:text-white">Platform System Rules</h3>

            <div>
              <label className="block text-xs font-bold card-heading dark:text-slate-300 uppercase tracking-wider mb-2">
                Community Verification Threshold
              </label>
              <input
                type="number"
                value={verificationThreshold}
                onChange={(e) => setVerificationThreshold(e.target.value)}
                className="w-full card-light dark:bg-slate-950 dark:border-slate-800 rounded-xl px-4 py-3 text-xs card-heading dark:text-white font-mono focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] body-text dark:text-slate-500 mt-1">Minimum community confirmations needed to enter DS Triage queue.</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl card-light dark:bg-slate-950 dark:border-slate-800 text-xs">
              <div>
                <span className="font-bold card-heading dark:text-white block">Automated AI Priority Triage</span>
                <span className="body-text dark:text-slate-400 text-[11px]">Enable Gemini AI scoring and advisory summaries</span>
              </div>
              <input
                type="checkbox"
                checked={autoAiEnabled}
                onChange={(e) => setAutoAiEnabled(e.target.checked)}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeAdminTab === "audit" && (
          <div className="card-light dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base card-heading dark:text-white">Immutable Platform Audit Logs</h3>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl card-light dark:bg-slate-950 dark:border-slate-800 font-mono text-xs flex items-center justify-between body-text dark:text-slate-300">
                  <div>
                    <span className="text-rose-400 font-bold mr-2">[{log.action}]</span>
                    <span className="card-heading dark:text-white">{log.user}</span> → <span>{log.entity}</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">{log.time} • IP {log.ip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
