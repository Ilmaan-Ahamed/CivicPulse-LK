"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  ClipboardList,
  ScrollText,
  Flag,
  Settings,
  BarChart3,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  {
    href: "/admin/role-requests",
    label: "Role Requests",
    icon: ClipboardList,
    accent: "text-amber-400",
    activeBg: "bg-amber-500/10 border-amber-500/30",
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: Users,
    accent: "text-sky-400",
    activeBg: "bg-sky-500/10 border-sky-500/30",
  },
  {
    href: "/admin/audit-log",
    label: "Audit Log",
    icon: ScrollText,
    accent: "text-violet-400",
    activeBg: "bg-violet-500/10 border-violet-500/30",
  },
  {
    href: "/admin/moderation",
    label: "Moderation Queue",
    icon: Flag,
    accent: "text-rose-400",
    activeBg: "bg-rose-500/10 border-rose-500/30",
  },
  {
    href: "/admin/analytics",
    label: "System Analytics",
    icon: BarChart3,
    accent: "text-emerald-400",
    activeBg: "bg-emerald-500/10 border-emerald-500/30",
  },
  {
    href: "/admin/settings",
    label: "Platform Settings",
    icon: Settings,
    accent: "text-slate-400",
    activeBg: "bg-slate-500/10 border-slate-500/30",
  },
];

function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-slate-800 bg-[#080d16] min-h-screen sticky top-0">
      {/* Brand */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-500 to-orange-400 p-0.5 shadow-lg shadow-red-500/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080d16] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <div>
            <p className="font-bold text-sm text-white">CivicPulse</p>
            <p className="text-[10px] text-red-400 font-semibold uppercase tracking-widest">Admin Console</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 group ${
                isActive
                  ? `${item.activeBg} ${item.accent} border-opacity-100`
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? item.accent : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className={`w-3.5 h-3.5 ${item.accent}`} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <Link
          href="/citizen"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Back to Citizen View
        </Link>
        <div className="flex items-center gap-3 px-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 border border-slate-700",
              },
            }}
          />
          <p className="text-xs text-slate-400 font-medium">Admin Account</p>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0f1a]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
