export const ROLES = ["citizen", "field_officer", "department_admin", "super_admin"] as const;
export type Role = (typeof ROLES)[number];

// Which roles can access which route prefixes
export const ROUTE_ACCESS: Record<string, Role[]> = {
  "/dashboard/citizen": ["citizen", "department_admin", "super_admin"],
  "/dashboard/field": ["field_officer", "department_admin", "super_admin"],
  "/dashboard/admin": ["department_admin", "super_admin"],
  "/dashboard/super": ["super_admin"],
};