"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Calendar, ArrowRight, ShieldCheck, CheckCircle2, Building2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface CaseCardData {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priorityScore: number;
  address: string;
  dsDivisionName?: string;
  imageUrl?: string;
  verificationCount?: number;
  verificationThreshold?: number;
  createdAt: string | Date;
}

interface CaseCardProps {
  caseData: CaseCardData;
  onSelect?: (caseData: CaseCardData) => void;
  onVerify?: (caseId: string) => void;
  onAssign?: (caseId: string) => void;
}

export function CaseCard({ caseData, onSelect, onVerify, onAssign }: CaseCardProps) {
  const { currentRole } = useAuth();
  const { t } = useLanguage();

  const formattedDate = new Date(caseData.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="group card-light dark:bg-[#0a0a0a] dark:border-[#333333] rounded-2xl p-4 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#FDEEDC] dark:bg-[#111111] text-slate-700 dark:text-[#B0B0B0]">
            {caseData.caseNumber}
          </span>
          <StatusBadge status={caseData.status} size="sm" />
        </div>

        {/* Image Thumbnail (if available) */}
        {caseData.imageUrl && (
          <div className="relative w-full h-40 mb-3 rounded-xl overflow-hidden bg-[#FDEEDC] dark:bg-[#111111]">
            <img
              src={caseData.imageUrl}
              alt={caseData.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2">
              <PriorityIndicator score={caseData.priorityScore} showLabel={false} />
            </div>
          </div>
        )}

        {/* Title & Category */}
        <div className="mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#F97316] dark:text-[#FF8C00]">
            {caseData.category}
          </span>
          <h3 className="text-base font-semibold card-heading dark:text-white line-clamp-1 group-hover:text-[#F97316] dark:group-hover:text-[#FF8C00] transition-colors">
            {caseData.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs body-text line-clamp-2 mb-3 leading-relaxed">
          {caseData.description}
        </p>

        {/* Metadata Grid */}
        <div className="space-y-1 text-xs card-subtext border-t border-[var(--border)] dark:border-[#333333] pt-3 mb-3">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-[#FF8C00]/60 shrink-0" />
            <span className="truncate">{caseData.address}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400 dark:text-[#FF8C00]/60" />
              {formattedDate}
            </span>
            {caseData.verificationCount !== undefined && (
              <span className="font-medium card-heading dark:text-[#B0B0B0]">
                {caseData.verificationCount}/{caseData.verificationThreshold || 3} Verifications
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-2 border-t border-[#E8D5B5] dark:border-[#333333]/60 flex items-center justify-between gap-2">
        {currentRole === "COMMUNITY_VERIFIER" && caseData.status === "PENDING" && onVerify && (
          <button
            onClick={() => onVerify(caseData.id)}
            className="btn-primary-orange w-full py-1.5 px-3 text-xs flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Issue</span>
          </button>
        )}

        {currentRole === "DS_OFFICER" && (caseData.status === "VERIFIED" || caseData.status === "PENDING") && onAssign && (
          <button
            onClick={() => onAssign(caseData.id)}
            className="btn-primary-orange w-full py-1.5 px-3 text-xs flex items-center justify-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Assign Agency</span>
          </button>
        )}

        {onSelect && (
          <button
            onClick={() => onSelect(caseData)}
            className="btn-secondary-orange w-full py-1.5 px-3 text-xs flex items-center justify-center gap-1"
          >
            <span>{t("btn.viewDetails")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
