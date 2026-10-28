"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { parseEuro } from "@/lib/admin/money";
import { checkbox, firstIssue, handleSchema, isUniqueError, loc, optionalHandle, parseJson, revalidateSite, str, type FormState } from "@/lib/admin/common";

const imageSchema = z.object({
  src: z
    .string()
    .trim()
    .min(1, "Afbeeldingspad ontbreekt")
    .max(500)
    .refine((v) => v.startsWith("/") || v.startsWith("https://"), "Afbeeldingspad moet met / of https:// beginnen"),
  alt: z.string().trim().max(300).default(""),
});

const euro = (label: string, required: boolean) =>
  z.string().transform((v, ctx) => {
    const c = parseEuro(v);
    if (c === null) {
      if (required) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} is verplicht` });
      return null;
    }
    if (Number.isNaN(c)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} "${v}" is geen geldig bedrag` });
      return null;
    }
    return c;
  });

const variantSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Varianttitel is verplicht").max(200),
  sku: z
    .string()
    .trim()
    .max(100)
    .transform((v) => v || null),
  price: euro("Prijs", true),
  compare: euro("Vergelijkingsprijs", false),
  available: z.boolean(),
});

const schema = z.object({
  id: z.string().optional(),
  handle: handleSchema,
  handleEn: optionalHandle,
  sortOrder: z.coerce.number().int().min(-9999).max(9999).default(0),
  images: z.array(imageSchema).max(50),
  variants: z.array(variantSchema).min(1, "Minimaal één variant is nodig").max(100),
  categoryIds: z.array(z.string()),
});

export async function saveProduct(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = schema.safeParse({
    id: str(form, "id") || undefined,
    handle: str(form, "handle"),
    handleEn: str(form, "handleEn"),
    sortOrder: str(form, "sortOrder") || 0,
    images: parseJson(form.get("images")),
    variants: parseJson(form.get("variants")),
    categoryIds: form.getAll("categoryIds").map(String),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const d = parsed.data;
  const title = loc(form, "title");
  if (!title.it) return { error: "Italiaanse titel is verplicht" };

  const variants = d.variants.map((v, i) => ({ ...v, priceCents: v.price as number, compareCents: v.compare, sortOrder: i }));
  const cheapest = variants.reduce((a, b) => (b.priceCents < a.priceCents ? b : a));
  const data = {
    handle: d.handle,
    handleEn: d.handleEn,
    title,
    body: { it: str(form, "body_it"), en: str(form, "body_en") },
    images: d.images,
    featured: checkbox(form, "featured"),
    published: checkbox(form, "published"),
    sortOrder: d.sortOrder,
    priceCents: cheapest.priceCents,
    compareCents: cheapest.compareCents,
  };
  const validCats = await db.category.findMany({ where: { id: { in: d.categoryIds } }, select: { id: true } });

  let id = d.id;
  try {
    id = await db.$transaction(async (tx) => {
      const product = id
        ? await tx.product.update({ where: { id }, data: { ...data, categories: { set: validCats } } })
        : await tx.product.create({ data: { ...data, categories: { connect: validCats } } });
      const existing = await tx.productVariant.findMany({ where: { productId: product.id }, select: { id: true } });
      const existingIds = new Set(existing.map((v) => v.id));
      const keep = variants.filter((v) => v.id && existingIds.has(v.id)).map((v) => v.id as string);
      await tx.productVariant.deleteMany({ where: { productId: product.id, id: { notIn: keep } } });
      for (const v of variants) {
        const vd = { title: v.title, sku: v.sku, priceCents: v.priceCents, compareCents: v.compareCents, available: v.available, sortOrder: v.sortOrder };
        if (v.id && existingIds.has(v.id)) await tx.productVariant.update({ where: { id: v.id }, data: vd });
        else await tx.productVariant.create({ data: { ...vd, productId: product.id } });
      }
      return product.id;
    });
  } catch (e) {
    if (isUniqueError(e)) return { error: "Deze handle (IT of EN) is al in gebruik door een ander product" };
    throw e;
  }
  revalidateSite();
  redirect(`/admin/shop/producten/${id}?opgeslagen=1`);
}

export async function deleteProduct(form: FormData) {
  await requireUser();
  const id = str(form, "id");
  await db.product.delete({ where: { id } }).catch(() => null);
  revalidateSite();
  redirect("/admin/shop/producten?verwijderd=1");
}

export async function toggleProductPublished(form: FormData) {
  await requireUser();
  const id = str(form, "id");
  const p = await db.product.findUnique({ where: { id }, select: { published: true } });
  if (p) await db.product.update({ where: { id }, data: { published: !p.published } });
  revalidateSite();
}
