import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCountryIntel } from "@/lib/ai/countryIntel";
import { assertExternalAiEnabled, enforcePromptBudget, parseJsonBody, publicErrorResponse, rateLimit } from "@/lib/security/api";
import { getResearchContext } from "@/lib/research/context";

const requestSchema = z.object({
  kitId: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1).max(120),
  committee: z.string().trim().min(1).max(160),
  topic: z.string().trim().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: "ai:intel", limit: Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 12) });
    assertExternalAiEnabled();
    const body = await parseJsonBody(request, requestSchema);
    enforcePromptBudget(body);
    const researchContext = await getResearchContext(body.kitId);
    const intel = await getCountryIntel({ ...body, researchContext });

    if (body.kitId) {
      await prisma.intel.upsert({
        where: { kitId: body.kitId },
        create: {
          kitId: body.kitId,
          summary: intel.summary,
          priorities: JSON.stringify(intel.priorities),
          redLines: JSON.stringify(intel.redLines),
          allies: JSON.stringify(intel.allies),
          risks: JSON.stringify(intel.risks),
          sources: JSON.stringify(intel.sources),
        },
        update: {
          summary: intel.summary,
          priorities: JSON.stringify(intel.priorities),
          redLines: JSON.stringify(intel.redLines),
          allies: JSON.stringify(intel.allies),
          risks: JSON.stringify(intel.risks),
          sources: JSON.stringify(intel.sources),
        },
      });
    }

    return NextResponse.json(intel);
  } catch (error) {
    return publicErrorResponse(error, "Portfolio intelligence failed.");
  }
}
