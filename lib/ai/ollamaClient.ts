import { Ollama } from "ollama";
import { z } from "zod";
import { parseAiJson } from "./json";

const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const defaultModel = process.env.OLLAMA_MODEL ?? "llama3.2:1b";

export const ollama = new Ollama({ host: baseUrl });

export async function generateOllamaJson<T>(
  prompt: string,
  schema: z.ZodType<T>,
  system = "You are a Model UN strategy analyst. Return strict JSON only.",
) {
  const response = await ollama.chat({
    model: defaultModel,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    options: {
      temperature: 0.2,
    },
  });

  return parseAiJson(response.message.content, schema);
}

export const ollamaDefaults = {
  baseUrl,
  model: defaultModel,
};

export async function getOllamaStatus() {
  try {
    const response = await ollama.list();
    const installedModels = response.models.map((model) => model.name);
    const modelInstalled = response.models.some(
      (model) => model.name === defaultModel || model.model === defaultModel,
    );

    return {
      reachable: true,
      modelInstalled,
      installedModels,
      installCommand: modelInstalled ? null : `ollama pull ${defaultModel}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      reachable: false,
      modelInstalled: false,
      installedModels: [],
      installCommand: `ollama pull ${defaultModel}`,
      error: message,
    };
  }
}

export { generateJson } from "./provider";
