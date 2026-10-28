"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkbox, firstIssue, handleSchema, isUniqueError, loc, optionalHandle, parseJson, revalidateSite, str, type FormState } from "@/lib/admin/common";

const section = z.object({
  html: z.string().max(200_000).default(""),
  images: z
    .array(z.object({ src: z.string().trim().max(500), alt: z.string().trim().max(300).default("") }))
    .max(50)
    .transform((list) => list.filter((i) => i.src)),
  ctas: z
    .array(z.object({ label: z.string().trim().max(120), href: z.string().trim().max(500) }))
    .max(10)
    .transform((list) => list.filter((c) => c.label && c.href)),
});

const schema = z.object({
  id: z.string().optional(),
  handle: handleSchema,
  handleEn: optionalHandle,
  sections: z.object({ it: z.array(section).max(60), en: z.array(section).max(60) }),
});

export async function savePage(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = schema.safeParse({
    id: str(form, "id") || undefined,
    handle: str(form, "handle"),
    handleEn: str(form, "handleEn"),
    sections: parseJson(form.get("sections")),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const d = parsed.data;
  const title = loc(form, "title");
  if (!title.it) return { error: "Italiaanse titel is verplicht" };
  const data = {
    handle: d.handle,
    handleEn: d.handleEn,
    title,
    description: loc(form, "description"),
    sections: d.sections,
    published: checkbox(form, "published"),
  };
  let id = d.id;
  try {
    if (id) await db.page.update({ where: { id }, data });
    else id = (await db.page.create({ data })).id;
  } catch (e) {
    if (isUniqueError(e)) return { error: "Deze handle (IT of EN) is al in gebruik door een andere pagina" };
    throw e;
  }
  revalidateSite();
  redirect(`/admin/paginas/${id}?opgeslagen=1`);
}

export async function deletePage(form: FormData) {
  await requireUser();
  await db.page.delete({ where: { id: str(form, "id") } }).catch(() => null);
  revalidateSite();
  redirect("/admin/paginas?verwijderd=1");
}
