export const ROLES = [
  "CITIZEN",
  "COMMUNITY_VERIFIER",
  "VOLUNTEER",
  "NGO",
  "GOVT_AGENCY",
  "DS_OFFICER",
  "ADMIN",
] as const;

export type Role = (typeof ROLES)[number];

export const normalizeRole = (role?: string | null): Role | undefined => {
  if (!role) return undefined;

  const normalized = role.toString().trim();
  const keyed = normalized.toUpperCase().replace(/[-\s]+/g, "_");

  const aliases: Record<string, Role> = {
    CITIZEN: "CITIZEN",
    COMMUNITY_VERIFIER: "COMMUNITY_VERIFIER",
    VOLUNTEER: "VOLUNTEER",
    NGO: "NGO",
    GOVT_AGENCY: "GOVT_AGENCY",
    DS_OFFICER: "DS_OFFICER",
    DEPARTMENT_ADMIN: "ADMIN",
    SUPER_ADMIN: "ADMIN",
    ADMIN: "ADMIN",
    FIELD_OFFICER: "DS_OFFICER",
  };

  return aliases[keyed] ?? undefined;
};

// Which roles can access which route prefixes. Keep route checks permissive during the demo
// login flow when Clerk metadata has not yet been populated for the selected role.
export const ROUTE_ACCESS: Record<string, Role[]> = {
  "/dashboard/citizen": ["CITIZEN", "COMMUNITY_VERIFIER", "VOLUNTEER", "NGO", "GOVT_AGENCY", "DS_OFFICER", "ADMIN"],
  "/dashboard/verifier": ["COMMUNITY_VERIFIER", "DS_OFFICER", "ADMIN"],
  "/dashboard/volunteer": ["VOLUNTEER", "DS_OFFICER", "ADMIN"],
  "/dashboard/ngo": ["NGO", "DS_OFFICER", "ADMIN"],
  "/dashboard/agency": ["GOVT_AGENCY", "DS_OFFICER", "ADMIN"],
  "/dashboard/ds-officer": ["DS_OFFICER", "ADMIN"],
  "/dashboard/admin": ["ADMIN"],
};