import { prisma } from "@/lib/db";
import { ReportCard } from "@/components/reports/report-card";
import Link from "next/link";
import { FilePlus, ShieldAlert } from "lucide-react";

export default async function CitizenReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { photos: true },
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-emerald-400" />
            Infrastructure Reports Feed
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse geotagged reports across Sri Lanka or submit a new infrastructure issue.
          </p>
        </div>

        <Link
          href="/citizen/reports/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all"
        >
          <FilePlus className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Reports Submitted Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Be the first citizen to report an infrastructure issue in your community!
          </p>
          <Link
            href="/citizen/reports/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
          >
            Create First Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
