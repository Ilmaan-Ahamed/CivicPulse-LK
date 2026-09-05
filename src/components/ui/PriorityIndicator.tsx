import React from "react";
import { Cpu, AlertTriangle, ShieldAlert } from "lucide-react";

interface PriorityIndicatorProps {
  score: number; // 1 to 100
  showLabel?: boolean;
}

export function PriorityIndicator({ score, showLabel = true }: PriorityIndicatorProps) {
  const rounded = Math.round(score);

  let colorClasses = "bg-orange-500 text-orange-950 dark:text-orange-100 border-orange-300";
  let label = "Low Priority";
  let Icon = Cpu;

  if (rounded >= 75) {
    colorClasses = "bg-rose-500 text-white dark:text-rose-100 border-rose-400";
    label = "High Urgency";
    Icon = ShieldAlert;
  } else if (rounded >= 50) {
    colorClasses = "bg-amber-500 text-amber-950 dark:text-amber-100 border-amber-400";
    label = "Medium Priority";
    Icon = AlertTriangle;
  }

  return (
    <div className="inline-flex items-center gap-1.5" title={`AI Priority Score: ${rounded}/100`}>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold ${colorClasses}`}>
        <Icon className="w-3 h-3 shrink-0" />
        <span>AI {rounded}</span>
      </span>
      {showLabel && <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>}
    </div>
  );
}
