import { NextResponse } from "next/server";
import { z } from "zod";

type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();

export class PublicApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

export function rateLimit(request: Request, options?: { key?: string; limit?: number; windowMs?: number }) {
  const limit = options?.limit ?? Number(process.env.API_RATE_LIMIT_PER_MINUTE ?? 60);
  const windowMs = options?.windowMs ?? 60_000;
  const key = `${options?.key ?? "api"}:${clientIp(request)}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  existing.count += 1;
  if (existing.count > limit) {
    throw new PublicApiError("Too many requests. Please wait before trying again.", 429);
  }
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  options?: { maxBytes?: number },
) {
  const maxBytes = options?.maxBytes ?? Number(process.env.API_MAX_BODY_BYTES ?? 64_000);
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength && contentLength > maxBytes) {
    throw new PublicApiError("Request body is too large.", 413);
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new PublicApiError("Request body is too large.", 413);
  }

  try {
    return schema.parse(JSON.parse(text || "{}"));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new PublicApiError("Invalid request body.", 400);
    }
    throw new PublicApiError("Malformed JSON request body.", 400);
  }
}

export function publicErrorResponse(error: unknown, fallback = "Request failed.") {
  if (error instanceof PublicApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message =
    process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : fallback;
  return NextResponse.json({ error: message }, { status: 500 });
}

export function assertExternalAiEnabled() {
  if (process.env.AI_EXTERNAL_CALLS_DISABLED === "true") {
    throw new PublicApiError("External AI calls are disabled by the server.", 503);
  }
}

export function enforcePromptBudget(value: unknown) {
  const maxChars = Number(process.env.AI_MAX_PROMPT_CHARS ?? 12_000);
  const text = JSON.stringify(value ?? "");
  if (text.length > maxChars) {
    throw new PublicApiError("Request is too large for AI generation.", 413);
  }
}
