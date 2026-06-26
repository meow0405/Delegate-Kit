import { z } from "zod";
import { parseAiJson } from "./json";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
const baseUrl = process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta";

export async function generateGeminiJson<T>(
  prompt: string,
  schema: z.ZodType<T>,
  system = "You are a Model UN strategy analyst. Return strict JSON only.",
) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await fetch(`${baseUrl}/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: system }],
      },
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${message}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n");

  if (!content) {
    throw new Error("Gemini returned an empty response.");
  }

  return parseAiJson(content, schema);
}

export const geminiDefaults = {
  configured: Boolean(apiKey),
  model,
  baseUrl,
};
