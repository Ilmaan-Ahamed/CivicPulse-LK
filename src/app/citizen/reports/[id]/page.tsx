import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Calendar, ShieldCheck, Building2, BrainCircuit,
  ArrowLeft, CheckCircle2, User,
} from "lucide-react";
import { formatDate, STATUS_COLORS, PRIORITY_COLORS, CATEGORY_LABELS } from "@/lib/utils";
import { MapView } from "@/components/shared/map-view";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      citizen: true,
      photos: true,
      verifications: { include: { verifier: true } },
      assignments: { include: { assignedTo: true, inspections: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!report) notFound();

  const statusStyle =
    STATUS_COLORS[report.status] || "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <Link
        href="/citizen/reports"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reports Feed
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {report.referenceNo}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {CATEGORY_LABELS[report.category] || report.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {report.priority && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${PRIORITY_COLORS[report.priority] || ""}`}>
                AI Priority: {report.priority}
              </span>
            )}
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle}`}>
              {report.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{report.title}</h1>

        {report.summary && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <BrainCircuit className="w-4 h-4" />
              Gemini AI Advisory Summary
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{report.summary}</p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Citizen Description</h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{report.description}</p>
        </div>

        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Reported by Citizen #{report.citizenId.substring(0, 8)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Submitted {formatDate(report.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{report.district ? `${report.district} District` : "GPS Geotagged"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Geotagged Location
          </h3>
          <MapView latitude={report.latitude} longitude={report.longitude} interactive={false} />
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Community Verification
            </h3>
            <Link href={`/citizen/verify/${report.id}`} className="text-xs font-semibold text-teal-400 hover:underline">
              Verify This Report →
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Verifications Received:</span>
              <span className="font-bold text-white">{report.verifications.length} Verifiers</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min((report.verifications.length / 3) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Requires 3 community confirmations to escalate to DS Office Triage.
            </p>
          </div>

          {report.assignments.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Assigned to: <strong>{report.assignments[0].assignedTo.firstName || "Agency"}</strong>
                {" "}({report.assignments[0].status})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
