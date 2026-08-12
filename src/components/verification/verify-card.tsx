import Link from "next/link";
import { ArrowRight, ShieldCheck, Calendar, MapPin } from "lucide-react";
import { CATEGORY_LABELS, formatRelativeTime } from "@/lib/utils";

interface VerifyCardProps {
  report: {
    id: string;
    referenceNo: string;
    title: string;
    description: string;
    category: string;
    district?: string | null;
    createdAt: Date | string;
    verifications?: { status: string }[];
  };
}

export function VerifyCard({ report }: VerifyCardProps) {
  const confirmCount = report.verifications?.filter((v) => v.status === "CONFIRMED").length || 0;

  return (
    <div className="glass-card group p-6 flex flex-col justify-between h-full min-h-[220px] hover:border-teal-500/35 hover:shadow-[0_8px_32px_rgba(20,184,166,0.1)]">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20 uppercase">
            {report.referenceNo}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {CATEGORY_LABELS[report.category] || report.category}
          </span>
        </div>

        {/* Title & Description */}
<<<<<<< HEAD
        <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-teal-350 transition-colors duration-300 line-clamp-1">
=======
        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-teal-300 transition-colors duration-300 line-clamp-1">
>>>>>>> 7548f6d (Update CivicPulse development features)
          {report.title}
        </h3>
        <p className="text-xs text-muted line-clamp-2 leading-relaxed font-normal">
          {report.description}
        </p>
      </div>

      {/* Footer Info */}
<<<<<<< HEAD
      <div className="mt-4 pt-3.5 border-t border-slate-850 flex items-center justify-between text-[11px] text-muted">
=======
      <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
>>>>>>> 7548f6d (Update CivicPulse development features)
        <div className="flex items-center gap-1.5 font-semibold text-teal-400 bg-teal-500/5 border border-teal-500/10 px-2.5 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{confirmCount} Confirms</span>
        </div>

        <Link
          href={`/verify/${report.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors group/btn"
        >
          <span>Verify Report</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}


