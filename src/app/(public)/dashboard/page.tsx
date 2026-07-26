import { prisma } from "@/lib/db";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Building2,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/utils";

export default async function PublicDashboardPage() {
  // Aggregate real database stats
  const [totalReports, verifiedCount, resolvedCount, categoryCounts] =
    await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: "VERIFIED" } }),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.report.groupBy({
        by: ["category"],
        _count: { category: true },
      }),
    ]);

  const resolutionRate =
    totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Dashboard Title Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <BarChart3 className="w-4 h-4" />
          Real-time Civic Data & Transparency
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Public Transparency Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Open access to infrastructure reporting metrics, community verification accuracy, DS Office response rates, and repair resolutions across Sri Lanka.
        </p>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Reports</span>
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalReports}</div>
          <div className="text-[11px] text-slate-400">Submitted across Sri Lanka</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Community Verified</span>
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{verifiedCount}</div>
          <div className="text-[11px] text-slate-400">Escalated to DS Offices</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Resolved Repairs</span>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{resolvedCount}</div>
          <div className="text-[11px] text-slate-400">Completed with photo proof</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Resolution Rate</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{resolutionRate}%</div>
          <div className="text-[11px] text-slate-400">Average resolution efficiency</div>
        </div>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          Reports by Infrastructure Category
        </h3>

        {categoryCounts.length === 0 ? (
          <p className="text-xs text-slate-400">No report category data available yet.</p>
        ) : (
          <div className="space-y-4">
            {categoryCounts.map((item: { category: string; _count: { category: number } }) => {
              const label = CATEGORY_LABELS[item.category] || item.category;
              const count = item._count.category;
              const percentage = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;

              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{label}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
