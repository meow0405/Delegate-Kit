import { NextResponse } from "next/server";
import { z } from "zod";
import { buildNewsDigest } from "@/lib/ai/newsEngine";
import { assertExternalAiEnabled, enforcePromptBudget, parseJsonBody, publicErrorResponse, rateLimit } from "@/lib/security/api";

const requestSchema = z.object({
  query: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: "ai:news", limit: Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 12) });
    assertExternalAiEnabled();
    const { query } = await parseJsonBody(request, requestSchema);
    enforcePromptBudget({ query });
    const digest = await buildNewsDigest(query ?? "United Nations");
    return NextResponse.json(digest);
  } catch (error) {
    return publicErrorResponse(error, "News digest failed.");
  }
}
