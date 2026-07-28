import { prisma } from "@/lib/db";
import Link from "next/link";
import { Building2, AlertTriangle, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { formatRelativeTime, PRIORITY_COLORS, CATEGORY_LABELS } from "@/lib/utils";

export default async function DSConsolePage() {
  // Fetch reports needing DS Office triage (VERIFIED or ASSIGNED)
  const verifiedReports = await prisma.report.findMany({
    where: {
      status: { in: ["VERIFIED", "ASSIGNED", "IN_PROGRESS", "FIELD_VERIFIED"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      verifications: true,
      assignments: {
        include: {
          assignedTo: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Console Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Building2 className="w-4 h-4" />
          Divisional Secretariat Institutional Coordinator
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          DS Office Coordination Console
        </h1>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          Triage community-verified reports, review Gemini AI priority suggestions, and assign cases to Municipal Councils, RDA, NWSDB, NGOs, or volunteer teams.
        </p>
      </div>

      {/* Verified Reports Queue Table/Cards */}
      {verifiedReports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Verified Reports Awaiting Assignment</h3>
          <p className="text-xs text-muted">
            As soon as community members confirm 3 verifications for a report, it will appear here for DS Office triage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifiedReports.map((report) => {
            const isAssigned = report.assignments.length > 0;
            const latestAssignment = isAssigned ? report.assignments[0] : null;

            return (
              <div
                key={report.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {report.referenceNo}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {CATEGORY_LABELS[report.category] || report.category}
                    </span>
                    {report.priority && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          PRIORITY_COLORS[report.priority] || ""
                        }`}
                      >
                        Priority: {report.priority}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-white">{report.title}</h3>
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>

                  {isAssigned && latestAssignment && (
                    <div className="text-xs text-emerald-400 flex items-center gap-2 pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Assigned to: <strong>{latestAssignment.assignedTo.firstName || "Agency Agent"}</strong> ({latestAssignment.status})
                      </span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <Link
                    href={`/ds-console/${report.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-foreground font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    {isAssigned ? "Manage Assignment" : "Assign Authority"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


