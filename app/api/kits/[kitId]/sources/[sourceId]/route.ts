import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ kitId: string; sourceId: string }> }) {
  const { kitId, sourceId } = await params;
  const result = await prisma.researchSource.deleteMany({ where: { id: sourceId, kitId } });
  return result.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Research source not found." }, { status: 404 });
}
