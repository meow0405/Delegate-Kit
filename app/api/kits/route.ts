import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { serializeKit } from "@/lib/db/serializers";
import { encodeKitNotes } from "@/lib/db/kitNotes";
import { parseJsonBody, publicErrorResponse, rateLimit } from "@/lib/security/api";

const createKitSchema = z.object({
  name: z.string().trim().max(160).optional(),
  committee: z.string().trim().min(1).max(160),
  committeeDescription: z.string().trim().max(2_000).optional(),
  country: z.string().trim().min(1).max(120),
  topic: z.string().trim().min(1).max(500),
  notes: z.string().trim().max(4_000).optional(),
  roster: z.array(z.string().trim().max(120)).max(250).optional(),
});

export async function GET() {
  const kits = await prisma.kit.findMany({
    orderBy: { updatedAt: "desc" },
    include: { intel: true, relations: true, speeches: { orderBy: { createdAt: "desc" } }, exports: true },
  });

  return NextResponse.json({ kits: kits.map(serializeKit) });
}

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: "kits:create", limit: Number(process.env.WRITE_RATE_LIMIT_PER_MINUTE ?? 30) });
    const body = await parseJsonBody(request, createKitSchema);
    const kit = await prisma.kit.create({
      data: {
        name: body.name || `${body.country} delegate kit`,
        committee: body.committee,
        committeeDescription: body.committeeDescription,
        country: body.country,
        topic: body.topic,
        notes: encodeKitNotes({ notes: body.notes, roster: body.roster }),
      },
    });

    return NextResponse.json({ kit }, { status: 201 });
  } catch (error) {
    return publicErrorResponse(error, "Could not create kit.");
  }
}
