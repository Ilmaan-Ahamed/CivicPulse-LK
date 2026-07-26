import { prisma } from "@/lib/db";
import { VerifyCard } from "@/components/verification/verify-card";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export default async function VerifyFeedPage() {
  // Fetch unverified reports (SUBMITTED or UNDER_VERIFICATION)
  const unverifiedReports = await prisma.report.findMany({
    where: {
      status: { in: ["SUBMITTED", "UNDER_VERIFICATION"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      verifications: true,
    },
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-teal-400" />
          Community Verification Layer
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Help filter out false or exaggerated complaints. Confirm infrastructure reports near you to earn trust points and escalate verified issues to Divisional Secretariat offices.
        </p>
      </div>

      {unverifiedReports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto" />
          <h3 className="text-base font-bold text-white">All Clear! No Pending Verifications</h3>
          <p className="text-xs text-slate-400">
            All submitted reports in your area have been verified or triaged.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unverifiedReports.map((report) => (
            <VerifyCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
