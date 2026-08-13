import type { Role } from "@prisma/client";

/**
 * Where each role lands. Paths must match the folders under src/app/dashboard/
 * and stay in sync with the switch statement in login/page.tsx.
 */
export const ROLE_HOME_ROUTES: Record<Role, string> = {
  CITIZEN: "/dashboard/citizen",
  VERIFIER: "/dashboard/verifier",
  DS_OFFICER: "/dashboard/ds-officer",
  AGENCY: "/dashboard/agency",
  NGO: "/dashboard/ngo",
  VOLUNTEER: "/dashboard/volunteer",
  ADMIN: "/dashboard/admin",
};

/** Human-readable labels, matching the ROLE_OPTIONS on the login/register page */
export const ROLE_LABELS: Record<Role, string> = {
  CITIZEN: "Citizen",
  VERIFIER: "Community Verifier",
  DS_OFFICER: "DS Officer",
  AGENCY: "Government Agency",
  NGO: "NGO Partner",
  VOLUNTEER: "Field Volunteer",
  ADMIN: "Administrator",
};