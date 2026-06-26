import { z } from "zod";
import { generateGeminiJson, geminiDefaults } from "./geminiClient";
import { generateOllamaJson, ollamaDefaults } from "./ollamaClient";
import { generateOpenAiJson, openAiDefaults } from "./openaiClient";

type AiProvider = "auto" | "openai" | "ollama" | "gemini";

const provider = (process.env.AI_PROVIDER as AiProvider | undefined) ?? "auto";
const requestTimeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 30_000);

function externalCallsDisabled() {
  return process.env.AI_EXTERNAL_CALLS_DISABLED === "true";
}

async function withTimeout<T>(operation: Promise<T>, label: string) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timer = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${requestTimeoutMs}ms.`)), requestTimeoutMs);
  });

  try {
    return await Promise.race([operation, timer]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function shouldTryOpenAi() {
  return (provider === "openai" || provider === "auto") && openAiDefaults.configured;
}

function shouldTryGemini() {
  return (provider === "gemini" || provider === "auto") && geminiDefaults.configured;
}

function shouldTryOllama() {
  return provider === "ollama" || provider === "auto" || (!openAiDefaults.configured && !geminiDefaults.configured);
}

async function callProvider<T>(
  selectedProvider: Exclude<AiProvider, "auto">,
  prompt: string,
  schema: z.ZodType<T>,
  system: string,
) {
  if (selectedProvider === "openai") return generateOpenAiJson(prompt, schema, system);
  if (selectedProvider === "gemini") return generateGeminiJson(prompt, schema, system);
  return generateOllamaJson(prompt, schema, system);
}

function providerOrder(): Array<Exclude<AiProvider, "auto">> {
  if (provider === "openai" || provider === "gemini" || provider === "ollama") return [provider];

  const order: Array<Exclude<AiProvider, "auto">> = [];
  if (shouldTryOpenAi()) order.push("openai");
  if (shouldTryGemini()) order.push("gemini");
  if (shouldTryOllama()) order.push("ollama");
  return order;
}

export async function generateJsonStrict<T>(
  prompt: string,
  schema: z.ZodType<T>,
  system = "You are a Model UN strategy analyst. Return strict JSON only.",
) {
  if (externalCallsDisabled()) {
    throw new Error("External AI calls are disabled by the server.");
  }

  const errors: string[] = [];

  for (const selectedProvider of providerOrder()) {
    try {
      return {
        data: await withTimeout(callProvider(selectedProvider, prompt, schema, system), selectedProvider),
        provider: selectedProvider,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${selectedProvider}: ${message}`);
      console.warn(`${selectedProvider} provider failed:`, error);
    }
  }

  throw new Error(
    `No AI provider returned valid JSON. Configure AI_PROVIDER plus OPENAI_API_KEY, GEMINI_API_KEY, or a running Ollama model. Details: ${errors.join(" | ") || "no provider configured"}`,
  );
}

export async function generateJson<T>(
  prompt: string,
  schema: z.ZodType<T>,
  fallback: T,
  system = "You are a Model UN strategy analyst. Return strict JSON only.",
) {
  if (externalCallsDisabled()) {
    return fallback;
  }

  if (shouldTryOpenAi()) {
    try {
      return await withTimeout(generateOpenAiJson(prompt, schema, system), "openai");
    } catch (error) {
      console.warn("OpenAI provider failed, falling back:", error);
      if (provider === "openai") return fallback;
    }
  }

  if (shouldTryGemini()) {
    try {
      return await withTimeout(generateGeminiJson(prompt, schema, system), "gemini");
    } catch (error) {
      console.warn("Gemini provider failed, falling back:", error);
      if (provider === "gemini") return fallback;
    }
  }

  if (shouldTryOllama()) {
    try {
      return await withTimeout(generateOllamaJson(prompt, schema, system), "ollama");
    } catch (error) {
      console.warn("Ollama provider failed, using local fallback:", error);
    }
  }

  return fallback;
}

export const aiDefaults = {
  provider,
  openai: openAiDefaults,
  gemini: geminiDefaults,
  ollama: ollamaDefaults,
};
