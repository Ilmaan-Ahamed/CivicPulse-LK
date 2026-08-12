import { Landmark, ClipboardCheck, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AgencyDashboardPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Landmark className="w-4 h-4" />
          Government Agency Portal
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Assigned Cases</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Track infrastructure cases officially assigned to your agency by DS Officers. Submit field verification
          reports and escalate resolved cases.
        </p>
      </div>

      <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 border-dashed flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <ClipboardCheck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Agency Case Management</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Case assignment workflow coming in the next sprint. Your agency will receive DS Office assignments here.
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
