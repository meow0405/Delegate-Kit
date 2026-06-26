import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { parseJsonBody, PublicApiError, publicErrorResponse, rateLimit } from "@/lib/security/api";

const updateSpeechSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  body: z.string().trim().min(1).max(20_000).optional(),
  type: z.string().trim().max(80).optional(),
  style: z.string().trim().max(80).optional(),
  seconds: z.number().int().min(15).max(300).optional(),
  focus: z.string().trim().max(500).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ speechId: string }> },
) {
  const { speechId } = await params;

  try {
    rateLimit(request, { key: "speeches:update", limit: Number(process.env.WRITE_RATE_LIMIT_PER_MINUTE ?? 30) });
    const body = await parseJsonBody(request, updateSpeechSchema);
    const speech = await prisma.speech.update({
      where: { id: speechId },
      data: {
        title: typeof body.title === "string" ? body.title : undefined,
        body: typeof body.body === "string" ? body.body : undefined,
        type: typeof body.type === "string" ? body.type : undefined,
        style: typeof body.style === "string" ? body.style : undefined,
        seconds: Number.isFinite(Number(body.seconds)) ? Number(body.seconds) : undefined,
        focus: typeof body.focus === "string" ? body.focus : undefined,
      },
    });

    return NextResponse.json({
      speech: {
        id: speech.id,
        type: speech.type,
        style: speech.style ?? undefined,
        seconds: speech.seconds ?? undefined,
        focus: speech.focus ?? undefined,
        title: speech.title,
        body: speech.body,
        talkingPoints: [],
        createdAt: speech.createdAt.toISOString(),
        updatedAt: speech.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof PublicApiError) return publicErrorResponse(error, "Could not update speech.");
    return NextResponse.json({ error: "Speech not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ speechId: string }> },
) {
  const { speechId } = await params;

  try {
    rateLimit(_request, { key: "speeches:delete", limit: Number(process.env.WRITE_RATE_LIMIT_PER_MINUTE ?? 30) });
    await prisma.speech.delete({ where: { id: speechId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Speech not found" }, { status: 404 });
  }
}
