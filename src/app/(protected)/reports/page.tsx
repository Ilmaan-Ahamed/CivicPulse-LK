<<<<<<< HEAD
﻿import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ReportCard } from "@/components/reports/report-card";
import Link from "next/link";
import { FilePlus, ShieldAlert, Filter } from "lucide-react";

export default async function ReportsPage() {
  const currentUser = await getCurrentUser();

  // Fetch reports from database
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      photos: true,
    },
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Infrastructure Reports Feed
          </h1>
          <p className="text-sm text-muted mt-1">
            Browse geotagged reports across Sri Lanka or submit a new infrastructure issue.
          </p>
        </div>

        <Link
          href="/reports/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-foreground font-bold text-sm shadow-xl shadow-primary/20 transition-all"
        >
          <FilePlus className="w-4 h-4" />
          Report New Issue
        </Link>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface border border-primary/20 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Reports Submitted Yet</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Be the first citizen to report an infrastructure issue in your community!
          </p>
          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-foreground font-semibold text-xs"
          >
            Create First Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
=======
import { redirect } from "next/navigation";

export default function LegacyReportsRedirect() {
  redirect("/citizen/reports");
>>>>>>> 7548f6d (Update CivicPulse development features)
}


