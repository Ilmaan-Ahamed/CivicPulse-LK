import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { RoleRequestActions } from "@/components/admin/role-request-actions";
import {
  ClipboardList, Clock, CheckCircle2, XCircle, Info,
  Building2, UserCircle2, Landmark, ShieldCheck, Calendar,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

// ─── Role badge helpers ───────────────────────────────────────────────────
const ROLE_LABELS: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  NGO:       { label: "NGO",         color: "text-violet-400 bg-violet-500/10 border-violet-500/30", Icon: Building2 },
  AGENCY:    { label: "Agency",      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",       Icon: Landmark },
  DS_OFFICER:{ label: "DS Officer",  color: "text-teal-400 bg-teal-500/10 border-teal-500/30",       Icon: ShieldCheck },
  CITIZEN:   { label: "Citizen",     color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", Icon: UserCircle2 },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  PENDING:    { label: "Pending",     color: "text-amber-400 bg-amber-500/10 border-amber-500/30",    Icon: Clock },
  APPROVED:   { label: "Approved",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", Icon: CheckCircle2 },
  REJECTED:   { label: "Rejected",    color: "text-red-400 bg-red-500/10 border-red-500/30",           Icon: XCircle },
  NEEDS_INFO: { label: "Needs Info",  color: "text-sky-400 bg-sky-500/10 border-sky-500/30",          Icon: Info },
};

type TabStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_INFO";

export default async function RoleRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Secondary auth gate (middleware is primary)
  await requireRole("ADMIN");

  const params = await searchParams;
  const activeTab: TabStatus = (params.status as TabStatus) || "PENDING";

  const [requests, counts] = await prisma.$transaction([
    prisma.roleRequest.findMany({
      where: { status: activeTab },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true, email: true, firstName: true, lastName: true,
            avatarUrl: true, createdAt: true,
          },
        },
        reviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    }),
    prisma.roleRequest.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count.id])
  );

  const tabs: { key: TabStatus; label: string }[] = [
    { key: "PENDING",    label: "Pending" },
    { key: "NEEDS_INFO", label: "Needs Info" },
    { key: "APPROVED",   label: "Approved" },
    { key: "REJECTED",   label: "Rejected" },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <ClipboardList className="w-3.5 h-3.5" />
          Role & Permission Requests
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Role Upgrade Requests</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review pending onboarding requests from NGOs, government agencies, and DS Officers.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-slate-800 pb-0">
        {tabs.map((tab) => {
          const count = countMap[tab.key] ?? 0;
          const isActive = activeTab === tab.key;
          return (
            <a
              key={tab.key}
              href={`/admin/role-requests?status=${tab.key}`}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                isActive
                  ? "border-amber-400 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab.key === "PENDING" ? "bg-amber-500 text-black" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {count}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {/* Request list */}
      {requests.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 font-medium">No {activeTab.toLowerCase().replace("_", " ")} requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const roleConfig = ROLE_LABELS[req.requestedRole] ?? ROLE_LABELS.CITIZEN;
            const statusConfig = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.PENDING;
            const RoleIcon = roleConfig.Icon;
            const StatusIcon = statusConfig.Icon;
            const userName = [req.user.firstName, req.user.lastName].filter(Boolean).join(" ") || req.user.email;

            return (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-5"
              >
                {/* Top row: user + role + status */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {req.user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={req.user.avatarUrl}
                        alt={userName}
                        className="w-10 h-10 rounded-full border border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">
                        {(userName[0] ?? "?").toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white text-sm">{userName}</p>
                      <p className="text-xs text-slate-400">{req.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${roleConfig.color}`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleConfig.label}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Org + justification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {req.orgName && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Organisation / Division
                      </p>
                      <p className="text-sm text-slate-200 font-medium">{req.orgName}</p>
                    </div>
                  )}
                  {req.dsDivision && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">DS Division</p>
                      <p className="text-sm text-slate-200">{req.dsDivision}</p>
                    </div>
                  )}
                </div>

                {req.justification && (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Justification</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{req.justification}</p>
                  </div>
                )}

                {/* Review note (for already-reviewed) */}
                {req.reviewNote && (
                  <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500 mb-1">Admin Note</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{req.reviewNote}</p>
                  </div>
                )}

                {/* Footer: date + reviewer + actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted {formatRelativeTime(req.createdAt)}
                    </span>
                    {req.reviewer && (
                      <span>
                        · Reviewed by {[req.reviewer.firstName, req.reviewer.lastName].filter(Boolean).join(" ") || req.reviewer.email}
                      </span>
                    )}
                  </div>

                  {req.status === "PENDING" || req.status === "NEEDS_INFO" ? (
                    <RoleRequestActions requestId={req.id} requestedRole={req.requestedRole} />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
