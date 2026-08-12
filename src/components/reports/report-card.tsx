import Link from "next/link";
import { MapPin, Calendar, ArrowRight, Image as ImageIcon } from "lucide-react";
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
    STATUS_COLORS[report.status] || "bg-slate-800/40 text-muted border-slate-750";
  const priorityStyle =
    report.priority && PRIORITY_COLORS[report.priority]
      ? PRIORITY_COLORS[report.priority]
      : null;

  const firstPhoto = report.photos && report.photos.length > 0 ? report.photos[0].url : null;

  return (
    <div className="glass-card group overflow-hidden flex flex-col justify-between h-full min-h-[340px]">
      <div>
        {/* Card Image / Placeholder Header */}
        <div className="relative aspect-video w-full bg-[#0c1322] border-b border-slate-800/40 overflow-hidden">
          {firstPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={firstPhoto}
              alt={report.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-slate-900/60 to-slate-950/80">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
                  backgroundSize: "16px 16px",
                }}
              />
              <ImageIcon className="w-8 h-8 text-slate-700 group-hover:text-emerald-500/45 transition-colors duration-300" />
              <span className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider">No Photo Evidence</span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <span className="font-mono text-[10px] font-bold text-foreground bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/80 backdrop-blur-md">
              {report.referenceNo}
            </span>

            <div className="flex items-center gap-1.5">
              {priorityStyle && (
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border backdrop-blur-md uppercase tracking-wider ${priorityStyle}`}
                >
                  {report.priority}
                </span>
              )}
              <span
                className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-lg border backdrop-blur-md uppercase tracking-wider ${statusStyle}`}
              >
                {report.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-2.5">
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
            {CATEGORY_LABELS[report.category] || report.category}
          </span>
          <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-350 transition-colors duration-300 line-clamp-1">
            {report.title}
          </h3>
          <p className="text-xs text-muted line-clamp-2 leading-relaxed font-normal">
            {report.description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            {report.district && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-subtle" />
                {report.district}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-subtle" />
              {formatRelativeTime(report.createdAt)}
            </span>
          </div>

          <Link
            href={`/reports/${report.id}`}
            className="inline-flex items-center gap-1 text-emerald-400 font-bold hover:text-emerald-300 transition-colors group/btn"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}


