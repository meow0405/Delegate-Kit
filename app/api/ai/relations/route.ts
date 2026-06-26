import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { suggestRelations } from "@/lib/ai/relationsSuggest";
import { assertExternalAiEnabled, enforcePromptBudget, parseJsonBody, publicErrorResponse, rateLimit } from "@/lib/security/api";

const requestSchema = z.object({
  kitId: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1).max(120),
  committee: z.string().trim().max(160).optional(),
  topic: z.string().trim().min(1).max(500),
  roster: z.array(z.string().trim().min(1).max(120)).max(250),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: "ai:relations", limit: Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 12) });
    assertExternalAiEnabled();
    const body = await parseJsonBody(request, requestSchema);
    enforcePromptBudget(body);
    const suggestions = await suggestRelations(body);

    if (body.kitId) {
      await prisma.relation.deleteMany({ where: { kitId: body.kitId } });
      await prisma.relation.createMany({
        data: suggestions.map((suggestion) => ({
          kitId: body.kitId as string,
          country: suggestion.country,
          stance: suggestion.stance,
          confidence: suggestion.confidence,
          rationale: suggestion.rationale,
          bloc: suggestion.bloc,
        })),
      });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    return publicErrorResponse(error, "Relation generation failed.");
  }
}
