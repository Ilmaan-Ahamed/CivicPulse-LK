import { Building2, ClipboardList, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NgoDashboardPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
          <Building2 className="w-4 h-4" />
          NGO Portal
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Opportunity Board</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Review assignment requests from DS Offices, coordinate your field teams, and submit resolution reports for
          completed cases.
        </p>
      </div>

      {/* Coming soon placeholder */}
      <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 border-dashed flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          <ClipboardList className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">NGO Assignment Queue</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Assignment workflow coming in the next sprint. Your organisation will receive DS Office requests here.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          In development — Task 3
        </div>
        <Link
          href="/citizen/reports"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-xs font-semibold transition-all"
        >
          Browse Reports Feed
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
