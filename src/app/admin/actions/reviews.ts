"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkbox, firstIssue, revalidateSite, str, type FormState } from "@/lib/admin/common";

const schema = z.object({
  id: z.string().optional(),
  author: z.string().trim().min(1, "Auteur is verplicht").max(120),
  rating: z.coerce.number().int().min(1, "Rating 1-5").max(5, "Rating 1-5"),
  text: z.string().trim().min(1, "Tekst is verplicht").max(5000),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum")
    .transform((v) => new Date(`${v}T12:00:00Z`)),
  productName: z
    .string()
    .trim()
    .max(200)
    .transform((v) => v || null),
  productId: z.string().transform((v) => v || null),
});

export async function saveReview(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = schema.safeParse({
    id: str(form, "id") || undefined,
    author: str(form, "author"),
    rating: str(form, "rating"),
    text: str(form, "text"),
    date: str(form, "date"),
    productName: str(form, "productName"),
    productId: str(form, "productId"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { id, ...d } = parsed.data;
  if (d.productId && !(await db.product.findUnique({ where: { id: d.productId }, select: { id: true } }))) return { error: "Gekoppeld product bestaat niet" };
  const data = { ...d, published: checkbox(form, "published"), featured: checkbox(form, "featured") };
  if (id) await db.review.update({ where: { id }, data });
  else await db.review.create({ data });
  revalidateSite();
  redirect("/admin/reviews?opgeslagen=1");
}

export async function toggleReview(form: FormData) {
  await requireUser();
  const id = str(form, "id");
  const field = str(form, "field");
  if (field !== "published" && field !== "featured") return;
  const r = await db.review.findUnique({ where: { id }, select: { published: true, featured: true } });
  if (r) await db.review.update({ where: { id }, data: { [field]: !r[field] } });
  revalidateSite();
}

export async function deleteReview(form: FormData) {
  await requireUser();
  await db.review.delete({ where: { id: str(form, "id") } }).catch(() => null);
  revalidateSite();
  redirect("/admin/reviews?verwijderd=1");
}
