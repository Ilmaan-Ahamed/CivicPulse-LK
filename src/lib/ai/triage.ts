import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AiTriageResult {
  category: "ROADS" | "DRAINAGE" | "STREETLIGHTS" | "WATER" | "PUBLIC_BUILDINGS" | "SANITATION" | "OTHER";
  priorityScore: number; // 1 to 100
  summary: string;
  duplicateClusterSuggestion?: string;
  isHighUrgency: boolean;
  confidence: number;
}

export async function analyzeReportWithAi(
  title: string,
  description: string,
  category: string,
  locationName: string
): Promise<AiTriageResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are the CivicPulse LK AI Advisory System for public infrastructure in Sri Lanka.
Analyze the following citizen infrastructure issue report:
Title: "${title}"
Category: "${category}"
Description: "${description}"
Location: "${locationName}"

Respond ONLY in valid JSON format matching this exact schema:
{
  "category": "ROADS" | "DRAINAGE" | "STREETLIGHTS" | "WATER" | "PUBLIC_BUILDINGS" | "SANITATION" | "OTHER",
  "priorityScore": number (1 to 100 based on public hazard, traffic disruption, flood risk, or safety),
  "summary": "1-2 sentence executive summary for DS Officer triage",
  "isHighUrgency": boolean,
  "confidence": number (0.0 to 1.0)
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      return {
        category: parsed.category || category || "ROADS",
        priorityScore: parsed.priorityScore ?? calculateFallbackPriority(title, description),
        summary: parsed.summary || `${title}: ${description.substring(0, 120)}...`,
        isHighUrgency: parsed.isHighUrgency ?? parsed.priorityScore >= 75,
        confidence: parsed.confidence ?? 0.88,
      };
    } catch (error) {
      console.warn("Gemini API call failed, using intelligent advisory fallback:", error);
    }
  }

  // Fallback AI engine when API key is unconfigured or offline
  return generateAdvisoryFallback(title, description, category);
}

function calculateFallbackPriority(title: string, description: string): number {
  let score = 50;
  const text = (title + " " + description).toLowerCase();

  if (text.includes("accident") || text.includes("hazard") || text.includes("danger") || text.includes("burst") || text.includes("flood")) {
    score += 25;
  }
  if (text.includes("main road") || text.includes("galle road") || text.includes("junction") || text.includes("school")) {
    score += 15;
  }
  if (text.includes("deep") || text.includes("collapsed") || text.includes("dark")) {
    score += 10;
  }

  return Math.min(Math.max(score, 15), 98);
}

function generateAdvisoryFallback(title: string, description: string, category: string): AiTriageResult {
  const priorityScore = calculateFallbackPriority(title, description);
  const isHighUrgency = priorityScore >= 75;

  return {
    category: (category as any) || "ROADS",
    priorityScore,
    summary: `Advisory Triage: Reported "${title}" at ${category.toLowerCase()} infrastructure level. Priority assigned based on hazard proximity and public impact.`,
    isHighUrgency,
    confidence: 0.85,
  };
}
