"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkbox, firstIssue, isUniqueError, revalidateSite, str, type FormState } from "@/lib/admin/common";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Naam is verplicht").max(80),
  svg: z
    .string()
    .trim()
    .max(100_000, "SVG is te groot")
    .refine((v) => /^<svg[\s>]/i.test(v) && /<\/svg>\s*$/i.test(v), "Plak volledige SVG-code (<svg …>…</svg>)")
    .refine((v) => !/<script|\son[a-z]+\s*=|javascript:|<foreignObject/i.test(v), "SVG mag geen scripts of event-handlers bevatten"),
});

function keyFrom(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40) || "betaalmethode"
  );
}

export async function savePaymentMethod(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = schema.safeParse({ id: str(form, "id") || undefined, name: str(form, "name"), svg: str(form, "svg") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { id, name, svg } = parsed.data;
  try {
    if (id) {
      await db.paymentMethod.update({ where: { id }, data: { name, svg } });
    } else {
      let key = keyFrom(name);
      if (await db.paymentMethod.findUnique({ where: { key } })) key = `${key}_${Date.now().toString(36)}`;
      const last = await db.paymentMethod.aggregate({ _max: { sortOrder: true } });
      await db.paymentMethod.create({ data: { key, name, svg, enabled: checkbox(form, "enabled"), sortOrder: (last._max.sortOrder ?? 0) + 1 } });
    }
  } catch (e) {
    if (isUniqueError(e)) return { error: "Er bestaat al een betaalmethode met deze sleutel" };
    throw e;
  }
  revalidateSite();
  return { ok: id ? "Betaalmethode bijgewerkt." : "Betaalmethode toegevoegd." };
}

export async function togglePaymentMethod(form: FormData) {
  await requireUser();
  const id = str(form, "id");
  const pm = await db.paymentMethod.findUnique({ where: { id }, select: { enabled: true } });
  if (pm) await db.paymentMethod.update({ where: { id }, data: { enabled: !pm.enabled } });
  revalidateSite();
}

export async function movePaymentMethod(form: FormData) {
  await requireUser();
  const id = str(form, "id");
  const dir = str(form, "dir") === "up" ? -1 : 1;
  const all = await db.paymentMethod.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true } });
  const i = all.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  // Volgorde normaliseren (0..n), zodat gelijke sortOrder-waarden geen probleem geven.
  await db.$transaction(all.map((p, k) => db.paymentMethod.update({ where: { id: p.id }, data: { sortOrder: k } })));
  revalidateSite();
}

export async function deletePaymentMethod(form: FormData) {
  await requireUser();
  await db.paymentMethod.delete({ where: { id: str(form, "id") } }).catch(() => null);
  revalidateSite();
}
