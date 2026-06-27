import { NextResponse } from "next/server";
import { analyzeStance } from "@/lib/ai/stanceAnalysis";
import { assertExternalAiEnabled, enforcePromptBudget, parseJsonBody, publicErrorResponse, rateLimit } from "@/lib/security/api";
import { z } from "zod";
import { getResearchContext } from "@/lib/research/context";

const requestSchema = z.object({
  country: z.string().trim().min(1).max(120),
  committee: z.string().trim().min(1).max(160),
  committeeDescription: z.string().trim().max(2_000).optional().nullable(),
  topic: z.string().trim().min(1).max(500),
  roster: z.array(z.string().trim().max(120)).max(250).optional(),
  notes: z.string().trim().max(4_000).optional().nullable(),
  kitId: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: "ai:stance", limit: Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 12) });
    assertExternalAiEnabled();
    const body = await parseJsonBody(request, requestSchema);
    enforcePromptBudget(body);
    const researchContext = await getResearchContext(body.kitId);
    const analysis = await analyzeStance({ ...body, researchContext });
    return NextResponse.json(analysis);
  } catch (error) {
    return publicErrorResponse(error, "Stance analysis failed. Check the configured AI provider.");
  }
}
