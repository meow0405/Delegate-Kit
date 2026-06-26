import { NextResponse } from "next/server";
import { z } from "zod";
import { buildCommitteeContext } from "@/lib/ai/buildCommitteeContext";
import { assertExternalAiEnabled, enforcePromptBudget, parseJsonBody, publicErrorResponse, rateLimit } from "@/lib/security/api";

const requestSchema = z.object({
  committee: z.string().trim().min(1).max(160),
  topic: z.string().trim().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: "ai:committee", limit: Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 12) });
    assertExternalAiEnabled();
    const { committee, topic } = await parseJsonBody(request, requestSchema);
    enforcePromptBudget({ committee, topic });
    const context = await buildCommitteeContext(committee, topic);
    return NextResponse.json(context);
  } catch (error) {
    return publicErrorResponse(error, "Committee context generation failed.");
  }
}
