import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/utils";

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
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 p-5 backdrop-blur-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
            {report.referenceNo}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {CATEGORY_LABELS[report.category] || report.category}
          </span>
        </div>

        <h3 className="font-bold text-base text-white">{report.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {report.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-teal-400">
          <ShieldCheck className="w-4 h-4" />
          <span>{confirmCount} Confirmations</span>
        </div>

        <Link
          href={`/verify/${report.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 transition-colors"
        >
          Verify Report
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
