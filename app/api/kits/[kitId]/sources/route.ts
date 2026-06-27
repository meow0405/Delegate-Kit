import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { prisma } from "@/lib/db/prisma";
import { PublicApiError, publicErrorResponse, rateLimit } from "@/lib/security/api";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const TEXT_TYPES = new Set(["text/plain", "text/markdown", "text/csv", "application/json", "text/html"]);
PDFParse.setWorker(pathToFileURL(path.join(process.cwd(), "node_modules", "pdf-parse", "dist", "worker", "pdf.worker.mjs")).href);

function cleanText(value: string) {
  return value.replace(/\0/g, "").replace(/\r\n/g, "\n").trim().slice(0, 200_000);
}

async function extractText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: bytes, isEvalSupported: false });
    try {
      return cleanText((await parser.getText({ parseHyperlinks: true })).text);
    } finally {
      await parser.destroy();
    }
  }
  if (TEXT_TYPES.has(file.type) || /\.(txt|md|markdown|csv|json|html?)$/i.test(file.name)) {
    return cleanText(new TextDecoder("utf-8", { fatal: false }).decode(bytes));
  }
  throw new PublicApiError("Use a PDF, TXT, Markdown, CSV, JSON, or HTML research file.", 415);
}

export async function GET(_request: Request, { params }: { params: Promise<{ kitId: string }> }) {
  const { kitId } = await params;
  const sources = await prisma.researchSource.findMany({
    where: { kitId },
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true, mimeType: true, sizeBytes: true, createdAt: true },
  });
  return NextResponse.json({ sources });
}

export async function POST(request: Request, { params }: { params: Promise<{ kitId: string }> }) {
  try {
    rateLimit(request, { key: "research:upload", limit: 20 });
    const { kitId } = await params;
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_FILE_BYTES + 100_000) throw new PublicApiError("The research file must be smaller than 10 MB.", 413);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new PublicApiError("Choose a research file to import.", 400);
    if (file.size === 0 || file.size > MAX_FILE_BYTES) throw new PublicApiError("The research file must be between 1 byte and 10 MB.", 413);
    const kit = await prisma.kit.findUnique({ where: { id: kitId }, select: { id: true } });
    if (!kit) throw new PublicApiError("This workspace no longer exists.", 404);
    const content = await extractText(file);
    if (content.length < 20) throw new PublicApiError("No usable text was found. Scanned PDFs need OCR before import.", 422);
    const source = await prisma.researchSource.create({
      data: { kitId, filename: file.name.slice(0, 180), mimeType: file.type || "application/octet-stream", sizeBytes: file.size, content },
      select: { id: true, filename: true, mimeType: true, sizeBytes: true, createdAt: true },
    });
    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    return publicErrorResponse(error, "The research file could not be imported.");
  }
}
