import { z } from "zod";
import { generateJsonStrict } from "./provider";
import { stanceAnalysisSchema, type StanceAnalysis } from "./schemas";

const stanceInputSchema = z.object({
  country: z.string().trim().min(1, "Portfolio is required."),
  committee: z.string().trim().min(1, "Committee is required."),
  topic: z.string().trim().min(1, "Agenda is required."),
  committeeDescription: z.string().trim().optional().nullable(),
  roster: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
});

export type StanceInput = z.infer<typeof stanceInputSchema>;

export function validateStanceInput(input: unknown) {
  return stanceInputSchema.parse(input);
}

export async function analyzeStance(rawInput: unknown): Promise<StanceAnalysis> {
  const input = validateStanceInput(rawInput);

  const prompt = `You are generating a Model UN portfolio stance analysis.

Inputs:
- Portfolio: ${input.country}
- Committee: ${input.committee}
- Committee context: ${input.committeeDescription || "Use the committee's standard mandate."}
- Agenda: ${input.topic}
- Roster context: ${input.roster?.length ? input.roster.join(", ") : "No roster provided."}
- Delegate notes: ${input.notes || "No notes provided."}

Return strict JSON with this exact shape:
{
  "stance": "support" | "neutral" | "oppose" | "mixed",
  "confidence": integer from 0 to 100,
  "summary": string,
  "reasoning": string[],
  "lawsAndPolicies": [{"name": string, "relevance": string}],
  "likelyArguments": string[],
  "detectedIssues": string[],
  "suggestedImprovements": string[],
  "cautions": string[]
}

Analysis rules:
- Do real analysis from the provided portfolio, committee, agenda, and context. Do not return a template.
- Classify the stance toward the agenda as support, neutral, oppose, or mixed.
- Explain what exact agenda wording would change the classification.
- Include relevant laws, policies, treaties, court decisions, party platforms, public statements, or recent policy changes when known.
- If the portfolio is a party, person, simulated territory, bloc, observer, or non-state actor, analyze that role directly.
- If a factual claim may be current or unstable, mark it for verification instead of inventing a citation.
- "Detected issues" should identify weaknesses, ambiguity, missing context, or contradictions in the portfolio's likely stance.
- "Suggested improvements" should give practical ways to strengthen speeches, amendments, caucus strategy, or research.
- Do not include markdown. Do not include commentary outside JSON.`;

  const { data, provider } = await generateJsonStrict(
    prompt,
    stanceAnalysisSchema,
    "You are a precise Model UN geopolitical and legal analyst. You must return valid JSON only.",
  );

  return {
    ...data,
    provider,
  };
}
