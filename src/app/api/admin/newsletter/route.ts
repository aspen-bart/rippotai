import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function cell(v: string) {
  // CSV-injectie voorkomen (Excel voert =, +, -, @ als formule uit) en quotes escapen.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

// CSV-export van nieuwsbriefinschrijvingen.
export async function GET() {
  if (!(await getSession())) return new Response("Niet ingelogd", { status: 401 });
  const rows = await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  const lines = [
    ["email", "marketing", "aangemeld_op"].join(";"),
    ...rows.map((r) => [cell(r.email), r.marketing ? "ja" : "nee", r.createdAt.toISOString()].join(";")),
  ];
  const date = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nieuwsbrief-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
