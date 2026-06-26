import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { generateSpeech } from "@/lib/ai/speechGenerator";
import { assertExternalAiEnabled, enforcePromptBudget, parseJsonBody, publicErrorResponse, rateLimit } from "@/lib/security/api";

const requestSchema = z.object({
  kitId: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1).max(120),
  committee: z.string().trim().min(1).max(160),
  topic: z.string().trim().min(1).max(500),
  stance: z.string().trim().max(4_000).optional(),
  type: z.string().trim().max(80).optional(),
  style: z.string().trim().max(80).optional(),
  seconds: z.number().int().min(15).max(300).optional(),
  modTopic: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: "ai:speech", limit: Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 12) });
    assertExternalAiEnabled();
    const body = await parseJsonBody(request, requestSchema);
    enforcePromptBudget(body);
    const speech = await generateSpeech(body);
    const type = body.type ?? "opening speech";
    const style = body.style ?? "formal";
    const seconds = Number(body.seconds) || undefined;
    const focus = body.type === "mod" && body.modTopic ? body.modTopic : body.topic;

    if (body.kitId) {
      const saved = await prisma.speech.create({
        data: {
          kitId: body.kitId,
          type,
          style,
          seconds,
          focus,
          title: speech.title,
          body: speech.body,
        },
      });

      return NextResponse.json({
        ...speech,
        id: saved.id,
        type: saved.type,
        style: saved.style ?? undefined,
        seconds: saved.seconds ?? undefined,
        focus: saved.focus ?? undefined,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      });
    }

    return NextResponse.json(speech);
  } catch (error) {
    return publicErrorResponse(error, "Speech generation failed.");
  }
}
