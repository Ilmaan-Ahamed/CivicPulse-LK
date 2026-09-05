export type UserRole =
  | "CITIZEN"
  | "NGO_PARTNER"
  | "DS_OFFICER"
  | "ADMIN";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  trustScore: number;
  organization?: string;
  dsDivisionCode: string;
  dsDivisionName: string;
  preferredLanguage: string;
}

export const MOCK_ROLE_USERS: Record<UserRole, UserProfile> = {
  CITIZEN: {
    id: "user-citizen-01",
    name: "Anusha Fernando",
    email: "citizen.anusha@civicpulse.lk",
    role: "CITIZEN",
    trustScore: 82.0,
    dsDivisionCode: "DS-COL-01",
    dsDivisionName: "Colombo DS Office",
    preferredLanguage: "en",
  },
  NGO_PARTNER: {
    id: "user-ngo-01",
    name: "Rotary Community Sri Lanka",
    email: "ngo.rotary@civicpulse.lk",
    role: "NGO_PARTNER",
    trustScore: 92.0,
    organization: "Rotary Sri Lanka District 3220",
    dsDivisionCode: "DS-COL-01",
    dsDivisionName: "Colombo DS Office",
    preferredLanguage: "en",
  },
  DS_OFFICER: {
    id: "user-dso-01",
    name: "K. Perera (DS Officer)",
    email: "dso.colombo@civicpulse.lk",
    role: "DS_OFFICER",
    trustScore: 98.0,
    organization: "Colombo Divisional Secretariat",
    dsDivisionCode: "DS-COL-01",
    dsDivisionName: "Colombo DS Office",
    preferredLanguage: "si",
  },
  ADMIN: {
    id: "user-admin-01",
    name: "Dinesh Abeywardena",
    email: "admin@civicpulse.lk",
    role: "ADMIN",
    trustScore: 100.0,
    organization: "CivicPulse LK Governance Board",
    dsDivisionCode: "DS-COL-01",
    dsDivisionName: "Colombo DS Office",
    preferredLanguage: "en",
  },
};

export function hasPermission(role: UserRole, action: string): boolean {
  if (role === "ADMIN") return true;

  switch (action) {
    case "REPORT_ISSUE":
    case "VIEW_MY_REPORTS":
    case "PROVIDE_FEEDBACK":
    case "VERIFY_REPORT":
    case "VIEW_VERIFICATION_QUEUE":
    case "PERFORM_FIELD_INSPECTION":
    case "SUBMIT_FIELD_EVIDENCE":
      return true;

    case "PLEDGE_SUPPORT":
    case "VIEW_NGO_BOARD":
    case "UPDATE_CASE_WORK":
    case "REPORT_BLOCKER":
      return role === "NGO_PARTNER" || role === "DS_OFFICER";

    case "TRIAGE_CASES":
    case "ASSIGN_AGENCY":
    case "REQUEST_FIELD_VERIFICATION":
    case "VIEW_DIVISION_ANALYTICS":
      return role === "DS_OFFICER";

    case "MANAGE_USERS":
    case "APPROVE_ROLES":
    case "MODERATE_CONTENT":
    case "VIEW_AUDIT_LOGS":
      return (role as string) === "ADMIN";

    default:
      return false;
  }
}
