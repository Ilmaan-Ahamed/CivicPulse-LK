import React from "react";
import { CheckCircle2, Clock, ShieldCheck, Building2, Wrench, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

export interface TimelineStep {
  title: string;
  description: string;
  timestamp?: string;
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
  iconType: "REPORT" | "VERIFY" | "TRIAGE" | "ASSIGN" | "REPAIR" | "RESOLVE";
}

interface CaseTimelineProps {
  currentStatus: string;
  steps?: TimelineStep[];
}

export function CaseTimeline({ currentStatus }: CaseTimelineProps) {
  const isPending = currentStatus === "PENDING";
  const isUnderVerify = currentStatus === "UNDER_VERIFICATION";
  const isVerified = currentStatus === "VERIFIED";
  const isAssigned = currentStatus === "ASSIGNED";
  const isInProgress = currentStatus === "IN_PROGRESS";
  const isResolved = currentStatus === "RESOLVED";

  const steps: TimelineStep[] = [
    {
      title: "Issue Reported",
      description: "Submitted by citizen with photos and GPS coordinates",
      timestamp: "Aug 10, 2026",
      status: "COMPLETED",
      iconType: "REPORT",
    },
    {
      title: "Community Verification",
      description: "Nearby verifiers confirm public hazard (Target: 3 votes)",
      timestamp: isPending ? "In Progress" : "Aug 11, 2026",
      status: isPending ? "CURRENT" : "COMPLETED",
      iconType: "VERIFY",
    },
    {
      title: "DS Officer Triage & Assignment",
      description: "Triaged with AI priority score and assigned to RDA Agency",
      timestamp: isAssigned || isInProgress || isResolved ? "Aug 12, 2026" : "Awaiting Triage",
      status: isAssigned || isInProgress || isResolved ? "COMPLETED" : isVerified ? "CURRENT" : "UPCOMING",
      iconType: "TRIAGE",
    },
    {
      title: "Agency Field Repair Work",
      description: "Assigned RDA crew deployed on site with repair equipment",
      timestamp: isInProgress || isResolved ? "Aug 12, 2026" : "Pending Deployment",
      status: isResolved ? "COMPLETED" : isInProgress ? "CURRENT" : "UPCOMING",
      iconType: "REPAIR",
    },
    {
      title: "Resolved & Published",
      description: "Repair verified and published on Public Transparency map",
      timestamp: isResolved ? "Aug 13, 2026" : "Final Stage",
      status: isResolved ? "COMPLETED" : "UPCOMING",
      iconType: "RESOLVE",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>Case Lifecycle Timeline</span>
        </h4>
        <StatusBadge status={currentStatus} size="sm" />
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {steps.map((step, idx) => {
          let dotColor = "bg-slate-200 dark:bg-slate-800 text-slate-400";
          if (step.status === "COMPLETED") {
            dotColor = "bg-orange-600 text-white shadow-md shadow-orange-500/20";
          } else if (step.status === "CURRENT") {
            dotColor = "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse";
          }

          return (
            <div key={idx} className="relative group">
              <span
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${dotColor}`}
              >
                {step.status === "COMPLETED" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </span>

              <div>
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-white">{step.title}</h5>
                  {step.timestamp && (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{step.timestamp}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
