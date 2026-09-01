"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserRole, MOCK_ROLE_USERS } from "@/lib/auth/rbac";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Shuffle, X, Check, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function RoleSwitcherModal() {
  const { currentRole, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const rolesList: UserRole[] = ["CITIZEN", "NGO", "DS_OFFICER", "ADMIN"];

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);

    // Redirect to respective role dashboard
    switch (role) {
      case "CITIZEN":
        router.push("/dashboard/citizen");
        break;
      case "NGO":
        router.push("/dashboard/ngo");
        break;
      case "DS_OFFICER":
        router.push("/dashboard/ds-officer");
        break;
      case "ADMIN":
        router.push("/dashboard/admin");
        break;
    }
  };

  return (
    <>
      {/* Floating Demo Role Banner */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md px-3.5 py-2 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-2 transition-all hover:scale-105 group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs font-semibold">Active Role:</span>
          <RoleBadge role={currentRole} />
          <Shuffle className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-500 ml-1" />
        </button>
      </div>

      {/* Role Switcher Selection Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#271308] border border-slate-200 dark:border-[#4a230e] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                CivicPulse LK Role Switcher
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-orange-200/70 mb-4">
              Select any of the 4 role personas below to evaluate role-specific dashboards and workflows.
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {rolesList.map((role) => {
                const user = MOCK_ROLE_USERS[role];
                const isSelected = currentRole === role;

                return (
                  <div
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-orange-50 dark:bg-orange-950/50 border-orange-500 dark:border-orange-500 text-slate-900 dark:text-white shadow-xs"
                        : "bg-slate-50 dark:bg-[#361b0c] hover:bg-slate-100 dark:hover:bg-[#4a230e] border-slate-200 dark:border-[#4a230e] text-slate-700 dark:text-orange-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RoleBadge role={role} />
                      <div>
                        <h4 className="text-xs font-bold">{user.name}</h4>
                        <p className="text-[11px] text-slate-400 dark:text-orange-300/60">{user.email}</p>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
