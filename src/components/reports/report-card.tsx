import Link from "next/link";
import { MapPin, Calendar, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { formatRelativeTime, STATUS_COLORS, PRIORITY_COLORS, CATEGORY_LABELS } from "@/lib/utils";

interface ReportCardProps {
  report: {
    id: string;
    referenceNo: string;
    title: string;
    description: string;
    category: string;
    status: string;
    priority?: string | null;
    district?: string | null;
    createdAt: Date | string;
    verifyCount?: number;
    disputeCount?: number;
    photos?: { url: string }[];
  };
}

export function ReportCard({ report }: ReportCardProps) {
  const statusStyle =
    STATUS_COLORS[report.status] || "bg-slate-800 text-slate-300 border-slate-700";
  const priorityStyle =
    report.priority && PRIORITY_COLORS[report.priority]
      ? PRIORITY_COLORS[report.priority]
      : null;

  return (
    <div className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 p-5 backdrop-blur-md transition-all hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {report.referenceNo}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {CATEGORY_LABELS[report.category] || report.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {priorityStyle && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle}`}
              >
                {report.priority}
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyle}`}
            >
              {report.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
          {report.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {report.description}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {report.district && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {report.district}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {formatRelativeTime(report.createdAt)}
          </span>
        </div>

        <Link
          href={`/reports/${report.id}`}
          className="inline-flex items-center gap-1 text-emerald-400 font-semibold hover:text-emerald-300 text-xs transition-colors"
        >
          Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
