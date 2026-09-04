import type { Role } from "@prisma/client";

/**
 * Where each role lands. Paths must match the folders under src/app/dashboard/
 * and stay in sync with the switch statement in login/page.tsx.
 */
export const ROLE_HOME_ROUTES: Record<Role, string> = {
  CITIZEN: "/dashboard/citizen",
  NGO_PARTNER: "/dashboard/ngo",
  DS_OFFICER: "/dashboard/ds-officer",
  ADMIN: "/dashboard/admin",
};

/** Human-readable labels, matching the ROLE_OPTIONS on the login/register page */
export const ROLE_LABELS: Record<Role, string> = {
  CITIZEN: "Citizen",
  NGO_PARTNER: "NGO Partner",
  DS_OFFICER: "DS Officer",
  ADMIN: "Administrator",
};