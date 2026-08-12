import { z } from "zod";

// ===========================================
// Report Validators
// ===========================================

export const createReportSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be under 2000 characters"),
  category: z.enum([
    "ROAD_DAMAGE",
    "DRAINAGE",
    "STREETLIGHT",
    "WATER_SUPPLY",
    "WASTE",
    "BRIDGE",
    "PUBLIC_BUILDING",
    "SIDEWALK",
    "TRAFFIC_SIGNAL",
    "OTHER",
  ]),
  latitude: z
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  longitude: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  address: z.string().max(500).optional(),
  district: z.string().max(100).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

// ===========================================
// Verification Validators
// ===========================================

export const createVerificationSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  status: z.enum(["CONFIRMED", "DISPUTED", "NEEDS_INFO"]),
  comment: z
    .string()
    .max(1000, "Comment must be under 1000 characters")
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type CreateVerificationInput = z.infer<typeof createVerificationSchema>;

// ===========================================
// Assignment Validators
// ===========================================

export const createAssignmentSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  assignedToId: z.string().min(1, "Assignee is required"),
  notes: z.string().max(2000).optional(),
  deadline: z.string().datetime().optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const updateAssignmentSchema = z.object({
  status: z.enum([
    "PENDING",
    "ACCEPTED",
    "IN_PROGRESS",
    "COMPLETED",
    "DECLINED",
  ]),
  notes: z.string().max(2000).optional(),
});

export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;

// ===========================================
// Field Inspection Validators
// ===========================================

export const createInspectionSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  findings: z
    .string()
    .min(10, "Findings must be at least 10 characters")
    .max(3000, "Findings must be under 3000 characters"),
  result: z.enum([
    "CONFIRMED_RESOLVED",
    "PARTIALLY_RESOLVED",
    "NOT_RESOLVED",
    "ESCALATE",
  ]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;

// ===========================================
// Agency Validators
// ===========================================

export const createAgencySchema = z.object({
  name: z
    .string()
    .min(2, "Agency name must be at least 2 characters")
    .max(200),
  type: z.enum(["GOVERNMENT", "NGO", "VOLUNTEER_TEAM", "CSR"]),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(20).optional(),
  district: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
});

export type CreateAgencyInput = z.infer<typeof createAgencySchema>;

// ===========================================
// Query Parameter Validators
// ===========================================

export const reportQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum([
      "SUBMITTED",
      "UNDER_VERIFICATION",
      "VERIFIED",
      "ASSIGNED",
      "IN_PROGRESS",
      "FIELD_VERIFIED",
      "RESOLVED",
      "REJECTED",
      "CLOSED",
    ])
    .optional(),
  category: z
    .enum([
      "ROAD_DAMAGE",
      "DRAINAGE",
      "STREETLIGHT",
      "WATER_SUPPLY",
      "WASTE",
      "BRIDGE",
      "PUBLIC_BUILDING",
      "SIDEWALK",
      "TRAFFIC_SIGNAL",
      "OTHER",
    ])
    .optional(),
  district: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "priority", "status", "category"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;

// ===========================================
// Onboarding Validators
// ===========================================

const baseOnboardingFields = {
  preferredLang: z.enum(["EN", "SI", "TA"]).default("EN"),
  dsDivision: z.string().max(100).optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d\s\-()]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
};

export const onboardingSchema = z.discriminatedUnion("role", [
  // Citizen — instant access, no org fields
  z.object({
    role: z.literal("CITIZEN"),
    ...baseOnboardingFields,
  }),
  // NGO — requires org context for admin review
  z.object({
    role: z.literal("NGO"),
    ...baseOnboardingFields,
    orgName: z
      .string()
      .min(2, "Organisation name must be at least 2 characters")
      .max(200, "Organisation name must be under 200 characters"),
    justification: z
      .string()
      .min(10, "Please provide at least 10 characters of justification")
      .max(1000, "Justification must be under 1000 characters"),
  }),
  // Agency — requires org context for admin review
  z.object({
    role: z.literal("AGENCY"),
    ...baseOnboardingFields,
    orgName: z
      .string()
      .min(2, "Organisation name must be at least 2 characters")
      .max(200, "Organisation name must be under 200 characters"),
    justification: z
      .string()
      .min(10, "Please provide at least 10 characters of justification")
      .max(1000, "Justification must be under 1000 characters"),
  }),
  // DS Officer — requires division + justification for admin review
  z.object({
    role: z.literal("DS_OFFICER"),
    ...baseOnboardingFields,
    orgName: z
      .string()
      .min(2, "Division/office name must be at least 2 characters")
      .max(200)
      .optional(),
    justification: z
      .string()
      .min(10, "Please provide at least 10 characters of justification")
      .max(1000, "Justification must be under 1000 characters"),
  }),
]);

export type OnboardingInput = z.infer<typeof onboardingSchema>;
