import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VerifyForm } from "@/components/verification/verify-form";
import { ArrowLeft, ShieldCheck, MapPin } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/utils";

export default async function ReportVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
  });

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      <Link
        href="/verify"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Verification Feed
      </Link>

      {/* Target Report Overview */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-teal-400 font-bold">
            {report.referenceNo}
          </span>
          <span className="text-xs text-muted">
            {CATEGORY_LABELS[report.category] || report.category}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-white">{report.title}</h2>
        <p className="text-xs text-muted leading-relaxed">{report.description}</p>
      </div>

      {/* Verification Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          Submit Community Verification
        </div>

        <VerifyForm reportId={report.id} />
      </div>
    </div>
  );
}

