import fs from "node:fs/promises";
import path from "node:path";

const defaultExportDir = path.join(process.cwd(), "public", "exports");

export function getExportDir() {
  const configured = process.env.LOCAL_EXPORT_DIR?.trim();
  return configured ? path.resolve(configured) : defaultExportDir;
}

export function getSafeExportName(filename: string) {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function getExportPath(filename: string) {
  return path.join(getExportDir(), getSafeExportName(filename));
}

export function isPublicExportDir() {
  return path.resolve(getExportDir()) === path.resolve(defaultExportDir);
}

export function getExportUrl(filename: string) {
  const safeName = getSafeExportName(filename);
  return isPublicExportDir() ? `/exports/${safeName}` : `/api/export/files/${safeName}`;
}

export async function writeExportFile(filename: string, data: Buffer) {
  const safeName = getSafeExportName(filename);
  await fs.mkdir(getExportDir(), { recursive: true });
  await fs.writeFile(getExportPath(safeName), data);
  return {
    filename: safeName,
    absolutePath: getExportPath(safeName),
    publicPath: getExportUrl(safeName),
  };
}

export async function readExportFile(filename: string) {
  return fs.readFile(getExportPath(filename));
}
