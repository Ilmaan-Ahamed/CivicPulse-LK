import type { LucideIcon } from "lucide-react";
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  BarChart3,
} from "lucide-react";

export type PlatformModuleSlug =
  | "citizen-reporting"
  | "community-verification"
  | "ds-console"
  | "transparency-dashboard";

export type PlatformModule = {
  slug: PlatformModuleSlug;
  footerLabel: string;
  title: string;
  shortDescription: string;
  icon: LucideIcon;
  accentClass: string;
  features: string[];
  workflow: { step: string; detail: string }[];
  ctaHref: string;
  ctaLabel: string;
  accessNote?: string;
};

export const PLATFORM_MODULES: Record<PlatformModuleSlug, PlatformModule> = {
  "citizen-reporting": {
    slug: "citizen-reporting",
    footerLabel: "Citizen Reporting Form",
    title: "Citizen Reporting Form",
    shortDescription:
      "Submit geotagged infrastructure issues with photos, categories, and landmarks so DS offices receive structured, actionable cases instead of scattered social media posts.",
    icon: ShieldAlert,
    accentClass: "text-primary",
    features: [
      "GPS map pin and district selection for precise jurisdiction",
      "Photo evidence upload (up to 4 images) with category tags",
      "Automatic reference numbers and Gemini AI triage on submit",
      "Track status from submission through verification and resolution",
    ],
    workflow: [
      {
        step: "Describe the issue",
        detail: "Choose a category, title, and detailed description with nearby landmarks.",
      },
      {
        step: "Attach evidence",
        detail: "Upload photos and confirm coordinates on the interactive map.",
      },
      {
        step: "Submit for verification",
        detail: "Your report enters the community verification queue before DS triage.",
      },
    ],
    ctaHref: "/reports/new",
    ctaLabel: "Open reporting form",
    accessNote: "Sign in required to submit and manage your reports.",
  },
  "community-verification": {
    slug: "community-verification",
    footerLabel: "Community Verification Layer",
    title: "Community Verification Layer",
    shortDescription:
      "Nearby citizens confirm or dispute submitted reports. Weighted trust scores reduce noise so only credible issues reach Divisional Secretariat officers.",
    icon: ShieldCheck,
    accentClass: "text-primary-light",
    features: [
      "Verify, dispute, or request more info on pending reports",
      "Trust-weighted votes after three independent confirmations",
      "Feed of reports awaiting community review in your area",
      "Transparent escalation path to DS Office coordination",
    ],
    workflow: [
      {
        step: "Review nearby reports",
        detail: "Browse submitted issues with photos, map location, and descriptions.",
      },
      {
        step: "Cast your verification",
        detail: "Confirm authenticity, flag exaggeration, or ask for more details.",
      },
      {
        step: "Reach verification threshold",
        detail: "After three verifications, reports move to the DS Office console queue.",
      },
    ],
    ctaHref: "/verify",
    ctaLabel: "Go to verification feed",
    accessNote: "Sign in required to verify reports and earn trust points.",
  },
  "ds-console": {
    slug: "ds-console",
    footerLabel: "DS Office Console",
    title: "DS Office Console",
    shortDescription:
      "Divisional Secretariat institutional coordinators triage community-verified reports, review AI priority hints, and assign Municipal Councils, RDA, NWSDB, NGOs, or volunteer teams.",
    icon: Building2,
    accentClass: "text-accent",
    features: [
      "Queue of verified and in-progress assignments",
      "Reference numbers, categories, and Gemini priority labels",
      "Assign and manage authority handoffs per report",
      "Institutional workflow aligned with DS jurisdictions",
    ],
    workflow: [
      {
        step: "Triage verified queue",
        detail: "Open reports that cleared community verification.",
      },
      {
        step: "Review AI advisory",
        detail: "Use priority and category suggestions alongside officer judgment.",
      },
      {
        step: "Assign responsible authority",
        detail: "Route the case to the correct agency or field team and track status.",
      },
    ],
    ctaHref: "/ds-console",
    ctaLabel: "Open DS coordination console",
    accessNote: "Restricted to authenticated DS coordinators and institutional roles.",
  },
  "transparency-dashboard": {
    slug: "transparency-dashboard",
    footerLabel: "Public Transparency Dashboard",
    title: "Public Transparency Dashboard",
    shortDescription:
      "Open metrics on report volume, verification rates, resolutions, and category breakdowns so citizens and journalists can audit public infrastructure response.",
    icon: BarChart3,
    accentClass: "text-primary",
    features: [
      "Live counts from the production database",
      "Resolution rate and verified-report statistics",
      "Category distribution across infrastructure types",
      "No sign-in required for public accountability data",
    ],
    workflow: [
      {
        step: "Aggregate civic data",
        detail: "Stats refresh from submitted and resolved report records.",
      },
      {
        step: "Surface trends",
        detail: "See verification and repair progress at a national glance.",
      },
      {
        step: "Share openly",
        detail: "Use the dashboard in community meetings, media, and oversight.",
      },
    ],
    ctaHref: "/dashboard",
    ctaLabel: "View live dashboard",
  },
};

export const PLATFORM_MODULE_LIST = Object.values(PLATFORM_MODULES);

export function getPlatformModule(slug: string): PlatformModule | undefined {
  return PLATFORM_MODULES[slug as PlatformModuleSlug];
}
