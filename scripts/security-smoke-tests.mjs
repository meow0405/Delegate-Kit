import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([".git", ".next", "node_modules", "coverage"]);
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".yml", ".yaml", ".example", ".gitignore"]);
const failures = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) files.push(...walk(path.join(dir, entry.name)));
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (textExtensions.has(path.extname(entry.name)) || entry.name === ".env.example" || entry.name === ".gitignore") {
      files.push(fullPath);
    }
  }

  return files;
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const files = walk(root);
const source = files.map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
const envExample = read(".env.example");
const gitignore = read(".gitignore");

const envNames = new Set();
for (const { text } of source) {
  for (const match of text.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
    if (match[1] !== "NODE_ENV") envNames.add(match[1]);
  }
}

for (const envName of envNames) {
  assert(envExample.includes(`${envName}=`), `.env.example is missing ${envName}`);
}

assert(gitignore.includes(".env*"), ".gitignore must ignore env files");
assert(gitignore.includes("!.env.example"), ".gitignore must allow .env.example");
assert(gitignore.includes("/public/exports/*"), ".gitignore must ignore generated exports");
assert(fs.existsSync(path.join(root, "proxy.ts")), "proxy.ts auth gate is missing");
assert(fs.existsSync(path.join(root, ".github", "workflows", "security.yml")), "security workflow is missing");
assert(fs.existsSync(path.join(root, ".github", "dependabot.yml")), "Dependabot config is missing");

for (const { file, text } of source) {
  const relative = path.relative(root, file);
  if (relative === ".env.example" || relative.endsWith(".md")) continue;

  if (relative !== path.join("scripts", "security-smoke-tests.mjs")) {
    assert(!/dangerouslySetInnerHTML/.test(text), `${relative} uses dangerouslySetInnerHTML`);
  }
  assert(!/sk-[A-Za-z0-9_-]{20,}/.test(text), `${relative} appears to contain an OpenAI-style key`);
  assert(!/AIza[0-9A-Za-z_-]{20,}/.test(text), `${relative} appears to contain a Google API key`);

  if ((relative.startsWith("components") || relative.startsWith("app")) && !relative.startsWith(`app${path.sep}api${path.sep}`)) {
    const privateEnvMatches = [...text.matchAll(/process\.env\.([A-Z0-9_]+)/g)]
      .map((match) => match[1])
      .filter((name) => !name.startsWith("NEXT_PUBLIC_") && name !== "NODE_ENV");
    assert(privateEnvMatches.length === 0, `${relative} references private env vars in frontend-capable code: ${privateEnvMatches.join(", ")}`);
  }
}

if (failures.length) {
  console.error("Security smoke tests failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Security smoke tests passed.");
