import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  DUPLICATE_DETECTION_PROMPT,
  CATEGORY_CLASSIFICATION_PROMPT,
  PRIORITY_SCORING_PROMPT,
  DESCRIPTION_SUMMARY_PROMPT,
  fillPrompt,
} from "./prompts";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.3, // Low temperature for consistent, factual output
    topP: 0.8,
    maxOutputTokens: 1024,
    responseMimeType: "application/json",
  },
});

/**
 * Parse JSON response from Gemini, handling potential formatting issues.
 */
function parseAIResponse<T>(text: string): T {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    throw new Error(`Failed to parse AI response: ${text.substring(0, 200)}`);
  }
}

// ===========================================
// Triage Functions
// ===========================================

export interface DuplicateResult {
  isDuplicate: boolean;
  confidence: number;
  duplicateOfId: string | null;
  reasoning: string;
}

export interface CategoryResult {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface PriorityResult {
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  confidence: number;
  reasoning: string;
  estimatedImpact: string;
}

export interface SummaryResult {
  summary: string;
  keyIssues: string[];
}

export interface TriageResult {
  duplicate: DuplicateResult | null;
  category: CategoryResult | null;
  priority: PriorityResult | null;
  summary: SummaryResult | null;
  error?: string;
}

/**
 * Detect if a report is a duplicate of existing reports.
 */
export async function detectDuplicate(
  report: {
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    district?: string;
  },
  existingReports: {
    id: string;
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
  }[]
): Promise<DuplicateResult> {
  if (existingReports.length === 0) {
    return {
      isDuplicate: false,
      confidence: 1.0,
      duplicateOfId: null,
      reasoning: "No existing reports to compare against.",
    };
  }

  const existingReportsStr = existingReports
    .map(
      (r) =>
        `- ID: ${r.id} | Title: ${r.title} | Category: ${r.category} | Location: (${r.latitude}, ${r.longitude}) | Description: ${r.description.substring(0, 200)}`
    )
    .join("\n");

  const prompt = fillPrompt(DUPLICATE_DETECTION_PROMPT, {
    existingReports: existingReportsStr,
    title: report.title,
    description: report.description,
    category: report.category,
    latitude: String(report.latitude),
    longitude: String(report.longitude),
    district: report.district || "Unknown",
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseAIResponse<DuplicateResult>(text);
}

/**
 * Auto-classify a report's category from its description.
 */
export async function classifyCategory(
  description: string
): Promise<CategoryResult> {
  const prompt = fillPrompt(CATEGORY_CLASSIFICATION_PROMPT, {
    description,
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseAIResponse<CategoryResult>(text);
}

/**
 * Score the priority of a report.
 */
export async function scorePriority(report: {
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  district?: string;
}): Promise<PriorityResult> {
  const prompt = fillPrompt(PRIORITY_SCORING_PROMPT, {
    title: report.title,
    description: report.description,
    category: report.category,
    latitude: String(report.latitude),
    longitude: String(report.longitude),
    district: report.district || "Unknown",
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseAIResponse<PriorityResult>(text);
}

/**
 * Generate a concise summary of a report's description.
 */
export async function summarizeDescription(
  description: string,
  category: string
): Promise<SummaryResult> {
  const prompt = fillPrompt(DESCRIPTION_SUMMARY_PROMPT, {
    description,
    category,
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseAIResponse<SummaryResult>(text);
}

/**
 * Run the full AI triage pipeline on a report.
 * Each step is independent — if one fails, others still run.
 */
export async function runFullTriage(
  report: {
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    district?: string;
  },
  existingReports: {
    id: string;
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
  }[] = []
): Promise<TriageResult> {
  const results: TriageResult = {
    duplicate: null,
    category: null,
    priority: null,
    summary: null,
  };

  // Run all triage steps in parallel for speed
  const [duplicateResult, categoryResult, priorityResult, summaryResult] =
    await Promise.allSettled([
      detectDuplicate(report, existingReports),
      classifyCategory(report.description),
      scorePriority(report),
      summarizeDescription(report.description, report.category),
    ]);

  if (duplicateResult.status === "fulfilled") {
    results.duplicate = duplicateResult.value;
  }
  if (categoryResult.status === "fulfilled") {
    results.category = categoryResult.value;
  }
  if (priorityResult.status === "fulfilled") {
    results.priority = priorityResult.value;
  }
  if (summaryResult.status === "fulfilled") {
    results.summary = summaryResult.value;
  }

  // Log any errors
  const errors: string[] = [];
  if (duplicateResult.status === "rejected")
    errors.push(`Duplicate: ${duplicateResult.reason}`);
  if (categoryResult.status === "rejected")
    errors.push(`Category: ${categoryResult.reason}`);
  if (priorityResult.status === "rejected")
    errors.push(`Priority: ${priorityResult.reason}`);
  if (summaryResult.status === "rejected")
    errors.push(`Summary: ${summaryResult.reason}`);

  if (errors.length > 0) {
    results.error = errors.join("; ");
  }

  return results;
}
