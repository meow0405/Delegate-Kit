import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { serializeKit } from "@/lib/db/serializers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kitId: string }> },
) {
  const { kitId } = await params;
  const kit = await prisma.kit.findUnique({
    where: { id: kitId },
    include: { intel: true, relations: true, speeches: { orderBy: { createdAt: "desc" } }, exports: true },
  });

  if (!kit) {
    return NextResponse.json({ error: "Kit not found" }, { status: 404 });
  }

  return NextResponse.json({ kit: serializeKit(kit) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ kitId: string }> },
) {
  const { kitId } = await params;

  try {
    await prisma.kit.delete({
      where: { id: kitId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kit not found" }, { status: 404 });
  }
}
