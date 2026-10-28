import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Demomodus: zonder DATABASE_URL (bv. een Netlify-preview zonder database) draait de site op de meegeleverde
// SQLite-snapshot prisma/demo.db. Die wordt naar /tmp gekopieerd (de functie-bundel is alleen-lezen);
// bestellingen en berichten blijven daar alleen bewaard zolang de serverinstantie leeft. /admin staat dan uit.
export const isDemo = !process.env.DATABASE_URL;

function demoDatasourceUrl() {
  const candidates = [path.join(process.cwd(), "prisma", "demo.db"), path.join(__dirname, "..", "..", "..", "prisma", "demo.db"), "/var/task/prisma/demo.db"];
  const source = candidates.find((p) => fs.existsSync(p));
  if (!source) throw new Error(`prisma/demo.db niet gevonden (gezocht: ${candidates.join(", ")})`);
  const target = path.join(os.tmpdir(), "rippotai-demo.db");
  if (!fs.existsSync(target) || fs.statSync(source).mtimeMs > fs.statSync(target).mtimeMs) fs.copyFileSync(source, target);
  return `file:${target}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient(isDemo ? { datasourceUrl: demoDatasourceUrl() } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
