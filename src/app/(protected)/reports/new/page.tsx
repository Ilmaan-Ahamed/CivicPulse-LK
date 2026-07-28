import { ReportForm } from "@/components/reports/report-form";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewReportPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="space-y-4">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Report Public Infrastructure Issue
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Geotag damaged roads, broken streetlights, or drainage issues for community verification and DS triage.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <ReportForm />
      </div>
    </div>
  );
}


