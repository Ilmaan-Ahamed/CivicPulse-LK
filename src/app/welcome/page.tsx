import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { ROLE_HOME_ROUTES, ROLE_LABELS } from "@/lib/auth/role-routes";

export default async function WelcomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    redirect("/login");
  }

  const dashboardPath = ROLE_HOME_ROUTES[user.role];
  const roleLabel = ROLE_LABELS[user.role];
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDF6E3] via-[#FDEEDC] to-[#FFE4C4] dark:from-black dark:via-black dark:to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-400/10 dark:bg-[#FF8C00]/8 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md z-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F97316] dark:bg-[#FF8C00] text-white flex items-center justify-center shadow-xl shadow-orange-600/25 mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Welcome to CivicPulse, {displayName.split(" ")[0]}!
        </h1>

        <p className="text-sm text-slate-600 dark:text-[#B0B0B0] mb-1">
          Your account has been created successfully.
        </p>

        <p className="text-sm text-slate-600 dark:text-[#B0B0B0] mb-8">
          You're registered as a <span className="font-semibold text-[#F97316] dark:text-orange-400">{roleLabel}</span>.
        </p>

        <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#E8D5B5]/80 dark:border-[#333333]/80 rounded-2xl shadow-xl p-6 mb-6 text-left">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">What's next</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Head to your dashboard to get started. You can always switch roles or update your
            profile later from account settings.
          </p>
        </div>

        <Link
          href={dashboardPath}
          className="btn-primary-orange w-full py-3 text-sm flex items-center justify-center gap-2"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}