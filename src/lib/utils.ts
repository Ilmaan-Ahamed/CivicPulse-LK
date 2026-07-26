import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a human-readable string.
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Format a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Generate a human-readable reference number.
 */
export function generateReferenceNo(): string {
  const prefix = "CP";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate distance between two GPS coordinates in kilometers (Haversine formula).
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Status color mapping for badges.
 */
export const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  UNDER_VERIFICATION: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  VERIFIED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ASSIGNED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  IN_PROGRESS: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  FIELD_VERIFIED: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  RESOLVED: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  CLOSED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

/**
 * Priority color mapping for badges.
 */
export const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-600/20 text-red-400 border-red-600/30",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LOW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

/**
 * Category labels and icons mapping.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  ROAD_DAMAGE: "Road Damage",
  DRAINAGE: "Drainage / Blocked Drains",
  STREETLIGHT: "Broken Streetlight",
  WATER_SUPPLY: "Water Supply Issue",
  WASTE: "Waste / Garbage",
  BRIDGE: "Bridge Damage",
  PUBLIC_BUILDING: "Public Building",
  SIDEWALK: "Sidewalk Damage",
  TRAFFIC_SIGNAL: "Traffic Signal",
  OTHER: "Other",
};
