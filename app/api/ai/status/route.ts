import { NextResponse } from "next/server";
import { aiDefaults } from "@/lib/ai/provider";
import { getOllamaStatus } from "@/lib/ai/ollamaClient";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({
      provider: aiDefaults.provider,
      openai: { configured: aiDefaults.openai.configured },
      gemini: { configured: aiDefaults.gemini.configured },
      ollama: { configured: true },
    });
  }

  const ollamaStatus = await getOllamaStatus();

  return NextResponse.json({
    provider: aiDefaults.provider,
    openai: {
      configured: aiDefaults.openai.configured,
      model: aiDefaults.openai.model,
    },
    gemini: {
      configured: aiDefaults.gemini.configured,
      model: aiDefaults.gemini.model,
      baseUrl: aiDefaults.gemini.baseUrl,
    },
    ollama: {
      ...aiDefaults.ollama,
      ...ollamaStatus,
    },
  });
}
