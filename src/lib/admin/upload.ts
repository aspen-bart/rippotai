import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// LET OP: uploads worden lokaal in public/uploads/ opgeslagen. Op Netlify (serverless, read-only/ephemeral
// bestandssysteem) is dit NIET persistent — later vervangen door Netlify Blobs of S3 en dan de publieke URL teruggeven.

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const TYPES: Record<string, string[]> = {
  jpg: ["image/jpeg", "image/pjpeg"],
  jpeg: ["image/jpeg", "image/pjpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  svg: ["image/svg+xml"],
  avif: ["image/avif"],
};

export class UploadError extends Error {}

export async function saveUpload(file: File): Promise<string> {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) throw new UploadError("Geen bestand ontvangen");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Bestand is groter dan 8 MB");

  const original = path.basename(file.name || "upload");
  const ext = original.split(".").pop()?.toLowerCase() ?? "";
  const allowed = TYPES[ext];
  if (!allowed) throw new UploadError("Alleen jpg, png, webp, gif, svg of avif toegestaan");
  if (file.type && !allowed.includes(file.type)) throw new UploadError("Bestandstype komt niet overeen met de extensie");

  const buf = Buffer.from(await file.arrayBuffer());
  if (ext === "svg") {
    // SVG's worden vanaf hetzelfde domein geserveerd: geen scripts of event-handlers toestaan.
    const text = buf.toString("utf8");
    if (/<script|\son[a-z]+\s*=|javascript:|<foreignObject/i.test(text)) throw new UploadError("SVG bevat scripts of event-handlers");
  }

  const base =
    original
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "afbeelding";
  const name = `${base}-${Date.now().toString(36)}${randomBytes(3).toString("hex")}.${ext === "jpeg" ? "jpg" : ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}
