import type { Role } from "@prisma/client";

export const ROLE_DASHBOARD: Record<Role, string> = {
  CITIZEN: "/citizen",
  VERIFIER: "/citizen",
  VOLUNTEER: "/citizen",
  NGO: "/ngo",
  AGENCY: "/agency",
  DS_OFFICER: "/ds-officer",
  ADMIN: "/admin",
};