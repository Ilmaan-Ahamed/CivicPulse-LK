export const ROLES = [
  "CITIZEN",
  "NGO_PARTNER",
  "DS_OFFICER",
  "ADMIN",
] as const;

export type Role = (typeof ROLES)[number];

export const SIGNUP_ROLES = ["CITIZEN", "NGO_PARTNER", "DS_OFFICER", "ADMIN"] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

export function isSignupRole(role?: string | null): role is SignupRole {
  return !!role && (SIGNUP_ROLES as readonly string[]).includes(role);
}

export const normalizeRole = (role?: string | null): Role | undefined => {
  if (!role) return undefined;

  const normalized = role.toString().trim();
  const keyed = normalized.toUpperCase().replace(/[-\s]+/g, "_");

  const aliases: Record<string, Role> = {
    CITIZEN: "CITIZEN",
    COMMUNITY_VERIFIER: "CITIZEN",
    VERIFIER: "CITIZEN",
    VOLUNTEER: "CITIZEN",
    NGO: "NGO_PARTNER",
    NGO_PARTNER: "NGO_PARTNER",
    GOVT_AGENCY: "NGO_PARTNER",
    GOVERNMENT_AGENCY: "NGO_PARTNER",
    DS_OFFICER: "DS_OFFICER",
    DEPARTMENT_ADMIN: "ADMIN",
    SUPER_ADMIN: "ADMIN",
    ADMIN: "ADMIN",
    FIELD_OFFICER: "DS_OFFICER",
  };

  return aliases[keyed] ?? undefined;
};

// Route access is enforced from the server-side DB role to keep authorization
// least-privilege and avoid trusting browser-selected roles.
export const ROUTE_ACCESS: Record<string, Role[]> = {
  "/dashboard/citizen": ["CITIZEN"],
  "/dashboard/verifier": ["CITIZEN"],
  "/dashboard/volunteer": ["CITIZEN"],
  "/dashboard/ngo": ["NGO_PARTNER"],
  "/dashboard/agency": ["NGO_PARTNER"],
  "/dashboard/ds-officer": ["DS_OFFICER"],
  "/dashboard/admin": ["ADMIN"],
  "/ds-console": ["DS_OFFICER", "ADMIN"],
  "/ds-console/agencies": ["DS_OFFICER", "ADMIN"],
};