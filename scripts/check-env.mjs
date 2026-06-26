import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}

const required = ["DATABASE_URL", "NEXTAUTH_SECRET"];
const productionRequired = ["APP_BASIC_AUTH_USER", "APP_BASIC_AUTH_PASSWORD"];

const missing = required.filter((key) => !process.env[key]);
if (process.env.NODE_ENV === "production") {
  missing.push(...productionRequired.filter((key) => !process.env[key]));
}

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.OPENAI_API_KEY?.startsWith("sk-") && process.env.AI_PROVIDER === "openai") {
  console.log("OpenAI provider configured.");
}

if (process.env.GEMINI_API_KEY && process.env.AI_PROVIDER === "gemini") {
  console.log("Gemini provider configured.");
}

console.log("Environment validation passed.");
