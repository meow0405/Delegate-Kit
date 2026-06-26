import { NextResponse } from "next/server";
import { getSafeExportName, readExportFile } from "@/lib/storage/exports";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const safeName = getSafeExportName(filename);

  try {
    const file = await readExportFile(safeName);
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export not found" }, { status: 404 });
  }
}
