import React from "react";
import { Award, ShieldCheck } from "lucide-react";

interface TrustScoreProps {
  score: number;
}

export function TrustScore({ score }: TrustScoreProps) {
  const rounded = Math.round(score);

  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
      title={`Community Trust Score: ${rounded}% based on verified reports and history`}
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>{rounded}% Trust</span>
    </div>
  );
}
