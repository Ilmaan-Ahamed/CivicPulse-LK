/**
 * Structured prompts for Google Gemini AI triage service.
 * These prompts are advisory-only — they never override human decisions.
 */

export const DUPLICATE_DETECTION_PROMPT = `You are an AI assistant for CivicPulse LK, a public infrastructure reporting platform in Sri Lanka.

Your task is to determine if a NEW report is a duplicate of any EXISTING reports.

EXISTING REPORTS:
{existingReports}

NEW REPORT:
- Title: {title}
- Description: {description}
- Category: {category}
- Location: ({latitude}, {longitude})
- District: {district}

Analyze the new report against existing reports. Consider:
1. Similar descriptions or titles about the same issue
2. Geographic proximity (within 500 meters of each other)
3. Same category of infrastructure problem
4. Similar timeframe

Respond in valid JSON format:
{
  "isDuplicate": boolean,
  "confidence": number (0-1),
  "duplicateOfId": string | null,
  "reasoning": string
}`;

export const CATEGORY_CLASSIFICATION_PROMPT = `You are an AI assistant for CivicPulse LK, a public infrastructure reporting platform in Sri Lanka.

Classify the following report description into exactly ONE category.

REPORT DESCRIPTION:
{description}

AVAILABLE CATEGORIES:
- ROAD_DAMAGE: Potholes, cracked roads, road surface damage, road collapse
- DRAINAGE: Blocked drains, flooding, sewage overflow, stormwater issues
- STREETLIGHT: Broken or non-functional street lights, damaged poles
- WATER_SUPPLY: Water pipe leaks, no water supply, contaminated water
- WASTE: Illegal dumping, uncollected garbage, waste overflow
- BRIDGE: Bridge cracks, damaged railings, structural issues
- PUBLIC_BUILDING: Damaged government buildings, schools, hospitals
- SIDEWALK: Broken sidewalks, missing tiles, accessibility issues
- TRAFFIC_SIGNAL: Non-functional traffic lights, missing signs
- OTHER: Issues not fitting above categories

Respond in valid JSON format:
{
  "category": string,
  "confidence": number (0-1),
  "reasoning": string
}`;

export const PRIORITY_SCORING_PROMPT = `You are an AI assistant for CivicPulse LK, a public infrastructure reporting platform in Sri Lanka.

Assess the priority level of the following infrastructure report.

REPORT:
- Title: {title}
- Description: {description}
- Category: {category}
- Location: ({latitude}, {longitude})
- District: {district}

PRIORITY LEVELS:
- CRITICAL: Immediate danger to life or property (e.g., road collapse near school, exposed live wires, bridge structural failure, flooding in residential area)
- HIGH: Significant safety risk or major disruption (e.g., large pothole on main road, broken streetlight on busy road, sewage overflow near water source)
- MEDIUM: Notable inconvenience but no immediate danger (e.g., cracked sidewalk, slow water leak, minor road surface damage)
- LOW: Minor issue with limited impact (e.g., faded road markings, minor litter, cosmetic damage)

Consider:
1. Safety implications for citizens
2. Number of people likely affected
3. Urgency of repair needed
4. Potential for the issue to worsen

Respond in valid JSON format:
{
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "confidence": number (0-1),
  "reasoning": string,
  "estimatedImpact": string
}`;

export const DESCRIPTION_SUMMARY_PROMPT = `You are an AI assistant for CivicPulse LK, a public infrastructure reporting platform in Sri Lanka.

Summarize the following infrastructure report description into a clear, concise summary for government officials (DS Officers) to quickly understand the issue.

ORIGINAL DESCRIPTION:
{description}

CATEGORY: {category}

Requirements:
- Maximum 2 sentences
- Include the key issue, location details, and severity indicators
- Use professional, objective language
- Do not add information not present in the original

Respond in valid JSON format:
{
  "summary": string,
  "keyIssues": string[]
}`;

/**
 * Replace template variables in a prompt.
 */
export function fillPrompt(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}
