import OpenAI from "openai";
import { z } from "zod";
import { parseAiJson } from "./json";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const openai = apiKey
  ? new OpenAI({
      apiKey,
    })
  : null;

export async function generateOpenAiJson<T>(
  prompt: string,
  schema: z.ZodType<T>,
  system = "You are a Model UN strategy analyst. Return strict JSON only.",
) {
  if (!openai) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return parseAiJson(content, schema);
}

export const openAiDefaults = {
  configured: Boolean(apiKey),
  model,
};
