import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadPdfToDrive } from "@/lib/drive/upload";
import { getSafeExportName, readExportFile } from "@/lib/storage/exports";
import { parseJsonBody, publicErrorResponse, rateLimit } from "@/lib/security/api";

export const runtime = "nodejs";

const requestSchema = z.object({
  accessToken: z.string().trim().min(20).max(4_000),
  filename: z.string().trim().min(1).max(260),
});

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: "drive:upload", limit: Number(process.env.WRITE_RATE_LIMIT_PER_MINUTE ?? 30) });
    const { accessToken, filename } = await parseJsonBody(request, requestSchema, { maxBytes: 8_000 });

    const safeName = getSafeExportName(filename);
    const pdf = await readExportFile(safeName);
    const file = await uploadPdfToDrive({ accessToken, filename: safeName, pdf });

    return NextResponse.json({ file });
  } catch (error) {
    return publicErrorResponse(error, "Drive upload failed.");
  }
}
