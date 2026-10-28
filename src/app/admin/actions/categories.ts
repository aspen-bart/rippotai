"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkbox, firstIssue, handleSchema, imagePath, isUniqueError, loc, revalidateSite, str, type FormState } from "@/lib/admin/common";

const schema = z.object({
  id: z.string().optional(),
  handle: handleSchema,
  group: z.enum(["private", "company"]),
  parentId: z.string().transform((v) => v || null),
  image: imagePath,
  sortOrder: z.coerce.number().int().min(-9999).max(9999).default(0),
});

export async function saveCategory(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = schema.safeParse({
    id: str(form, "id") || undefined,
    handle: str(form, "handle"),
    group: str(form, "group"),
    parentId: str(form, "parentId"),
    image: str(form, "image"),
    sortOrder: str(form, "sortOrder") || 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const d = parsed.data;
  const title = loc(form, "title");
  if (!title.it) return { error: "Italiaanse titel is verplicht" };

  // Geen cyclus in de boom: de nieuwe parent mag niet deze categorie of een nakomeling ervan zijn.
  if (d.id && d.parentId) {
    let cur: string | null = d.parentId;
    for (let i = 0; cur && i < 50; i++) {
      if (cur === d.id) return { error: "Een categorie kan niet onder zichzelf of een eigen subcategorie hangen" };
      const p: { parentId: string | null } | null = await db.category.findUnique({ where: { id: cur }, select: { parentId: true } });
      cur = p?.parentId ?? null;
    }
  }

  const data = {
    handle: d.handle,
    group: d.group,
    parentId: d.parentId,
    image: d.image,
    sortOrder: d.sortOrder,
    published: checkbox(form, "published"),
    title,
    tagline: loc(form, "tagline"),
    description: loc(form, "description"),
  };
  let id = d.id;
  try {
    if (id) await db.category.update({ where: { id }, data });
    else id = (await db.category.create({ data })).id;
  } catch (e) {
    if (isUniqueError(e)) return { error: "Deze handle is al in gebruik" };
    throw e;
  }
  revalidateSite();
  redirect(`/admin/shop/categorieen/${id}?opgeslagen=1`);
}

export async function deleteCategory(form: FormData) {
  await requireUser();
  const id = str(form, "id");
  // Subcategorieën blijven bestaan (parent wordt leeg via onDelete: SetNull); productkoppelingen vervallen.
  await db.category.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  redirect("/admin/shop/categorieen?verwijderd=1");
}
