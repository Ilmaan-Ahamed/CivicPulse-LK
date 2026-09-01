import { useEffect, useState } from "react";

export interface SharedIssue {
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
  createdAt: string;
}

export const REPORT_SYNC_STORAGE_KEY = "civicpulse_reports";
export const REPORT_SYNC_EVENT = "civicpulse-report-sync";

function normalizeIssue(issue: Partial<SharedIssue>): SharedIssue | null {
  if (!issue || !issue.id || !issue.caseNumber || !issue.title || !issue.description) {
    return null;
  }

  return {
    id: issue.id,
    caseNumber: issue.caseNumber,
    title: issue.title,
    description: issue.description,
    category: issue.category || "ROADS",
    status: issue.status || "SUBMITTED",
    priorityScore: Number(issue.priorityScore ?? 65),
    address: issue.address || "Colombo, Sri Lanka",
    dsDivisionName: issue.dsDivisionName || "Colombo DS Office",
    imageUrl: issue.imageUrl,
    createdAt: issue.createdAt || new Date().toISOString(),
  };
}

export function getSharedIssues(): SharedIssue[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(REPORT_SYNC_STORAGE_KEY);
    if (!rawValue) return [];
    const saved = JSON.parse(rawValue) as Partial<SharedIssue>[];
    return saved.map(normalizeIssue).filter(Boolean) as SharedIssue[];
  } catch {
    return [];
  }
}

export function persistSharedIssues(issues: SharedIssue[]) {
  if (typeof window === "undefined") return;

  const normalized = issues
    .map(normalizeIssue)
    .filter((issue): issue is SharedIssue => Boolean(issue));

  const uniqueById = new Map<string, SharedIssue>();
  normalized.forEach((issue) => uniqueById.set(issue.id, issue));

  const deduped = Array.from(uniqueById.values());
  window.localStorage.setItem(REPORT_SYNC_STORAGE_KEY, JSON.stringify(deduped));
  window.dispatchEvent(new CustomEvent(REPORT_SYNC_EVENT, { detail: deduped }));
}

function generateIssueId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `issue-${crypto.randomUUID()}`;
  }

  return `issue-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function addSharedIssue(issue: Partial<SharedIssue>): SharedIssue | null {
  const normalized = normalizeIssue(issue);
  if (!normalized) return null;

  const existing = getSharedIssues();
  const safeId = existing.some((item) => item.id === normalized.id) ? generateIssueId() : normalized.id;
  const merged = { ...normalized, id: safeId };
  const updated = [merged, ...existing.filter((item) => item.caseNumber !== merged.caseNumber && item.id !== merged.id)];
  persistSharedIssues(updated);
  return merged;
}

export function useSharedIssues() {
  const [issues, setIssues] = useState<SharedIssue[]>([]);

  useEffect(() => {
    const syncIssues = () => {
      const nextIssues = getSharedIssues();
      const uniqueById = new Map<string, SharedIssue>();
      nextIssues.forEach((issue) => uniqueById.set(issue.id, issue));
      setIssues(Array.from(uniqueById.values()));
    };

    syncIssues();

    const onCustomEvent = () => syncIssues();
    window.addEventListener(REPORT_SYNC_EVENT, onCustomEvent);
    window.addEventListener("storage", onCustomEvent);

    return () => {
      window.removeEventListener(REPORT_SYNC_EVENT, onCustomEvent);
      window.removeEventListener("storage", onCustomEvent);
    };
  }, []);

  return issues;
}
