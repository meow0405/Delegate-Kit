import React from "react";
import { NextResponse } from "next/server";
import { Document, Page, StyleSheet, Text, renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { writeExportFile } from "@/lib/storage/exports";
import { parseJsonBody, publicErrorResponse, rateLimit } from "@/lib/security/api";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 42, fontSize: 11, fontFamily: "Helvetica", lineHeight: 1.5 },
  title: { fontSize: 22, marginBottom: 12, fontWeight: 700 },
  meta: { fontSize: 10, color: "#475569", marginBottom: 18 },
  heading: { fontSize: 14, marginTop: 14, marginBottom: 6, fontWeight: 700 },
  body: { marginBottom: 8 },
});

const requestSchema = z.object({
  kitId: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1).max(120),
  committee: z.string().trim().min(1).max(160),
  topic: z.string().trim().min(1).max(500),
  background: z.string().trim().max(8_000),
  position: z.string().trim().max(8_000),
  solutions: z.string().trim().max(8_000),
});

function createPaperDocument(body: Record<string, string>): React.ReactElement<React.ComponentProps<typeof Document>> {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.title }, "Position Paper"),
      React.createElement(Text, { style: styles.meta }, `${body.country} | ${body.committee} | ${body.topic}`),
      React.createElement(Text, { style: styles.heading }, "Background"),
      React.createElement(Text, { style: styles.body }, body.background),
      React.createElement(Text, { style: styles.heading }, "Portfolio Position"),
      React.createElement(Text, { style: styles.body }, body.position),
      React.createElement(Text, { style: styles.heading }, "Proposed Solutions"),
      React.createElement(Text, { style: styles.body }, body.solutions),
    ),
  ) as React.ReactElement<React.ComponentProps<typeof Document>>;
}

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: "export:pdf", limit: Number(process.env.WRITE_RATE_LIMIT_PER_MINUTE ?? 30) });
    const body = await parseJsonBody(request, requestSchema, { maxBytes: 32_000 });
    const filename = `${(body.country ?? "delegate").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-position-paper-${Date.now()}.pdf`;

    const buffer = await renderToBuffer(createPaperDocument(body));
    const file = await writeExportFile(filename, buffer);

    if (body.kitId) {
      await prisma.export.create({
        data: {
          kitId: body.kitId,
          filename: file.filename,
          path: file.publicPath,
        },
      });
    }

    return NextResponse.json({ filename: file.filename, path: file.publicPath });
  } catch (error) {
    return publicErrorResponse(error, "Could not export PDF.");
  }
}
