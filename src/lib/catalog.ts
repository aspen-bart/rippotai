import "server-only";
import { cache } from "react";
import { db } from "./db";
import { t, localePath, type Lang } from "./i18n";

export type Img = { src: string; alt: string };
export type PageSection = { html: string; images: Img[]; ctas: { label: string; href: string }[] };

export type CategoryView = {
  id: string;
  handle: string;
  group: string;
  title: string;
  tagline: string;
  description: string;
  image: string | null;
  href: string;
  parentId: string | null;
  productCount: number;
  children: CategoryView[];
};

export type ProductCardView = {
  id: string;
  handle: string;
  href: string;
  title: string;
  priceCents: number;
  compareCents: number | null;
  image: Img | null;
  hoverImage: Img | null;
  available: boolean;
  badge: string | null;
};

type CategoryRow = Awaited<ReturnType<typeof loadCategories>>[number];

const loadCategories = cache(() =>
  db.category.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { published: true } } } } },
  }),
);

export function productHandle(p: { handle: string; handleEn: string | null }, lang: Lang) {
  return lang === "en" && p.handleEn ? p.handleEn : p.handle;
}

export function productHref(p: { handle: string; handleEn: string | null }, lang: Lang) {
  return localePath(lang, `/products/${productHandle(p, lang)}`);
}

function toCategory(c: CategoryRow, all: CategoryRow[], lang: Lang): CategoryView {
  const children = all.filter((x) => x.parentId === c.id).map((x) => toCategory(x, all, lang));
  return {
    id: c.id,
    handle: c.handle,
    group: c.group,
    title: t(c.title, lang),
    tagline: t(c.tagline, lang),
    description: t(c.description, lang),
    image: c.image ?? children.find((x) => x.image)?.image ?? null,
    href: localePath(lang, `/collections/${c.handle}`),
    parentId: c.parentId,
    productCount: c._count.products + children.reduce((s, x) => s + x.productCount, 0),
    children,
  };
}

export async function getCategoryTree(lang: Lang) {
  const all = await loadCategories();
  return all.filter((c) => !c.parentId).map((c) => toCategory(c, all, lang));
}

export async function getCategory(handle: string, lang: Lang) {
  const all = await loadCategories();
  const row = all.find((c) => c.handle === handle);
  if (!row) return null;
  const cat = toCategory(row, all, lang);
  const parentRow = row.parentId ? all.find((c) => c.id === row.parentId) : null;
  const parent = parentRow ? toCategory(parentRow, all, lang) : null;
  return { ...cat, parent };
}

type ProductRow = Awaited<ReturnType<typeof db.product.findMany>>[number];

export function toCard(p: ProductRow & { variants?: { available: boolean }[] }, lang: Lang): ProductCardView {
  const images = (p.images as Img[]) ?? [];
  const title = t(p.title, lang);
  return {
    id: p.id,
    handle: p.handle,
    href: productHref(p, lang),
    title,
    priceCents: p.priceCents,
    compareCents: p.compareCents,
    image: images[0] ? { ...images[0], alt: images[0].alt || title } : null,
    hoverImage: images[1] ? { ...images[1], alt: images[1].alt || title } : null,
    available: p.variants ? p.variants.some((v) => v.available) : true,
    badge: p.compareCents && p.compareCents > p.priceCents ? "sale" : p.featured ? "featured" : null,
  };
}

/** Producten van een categorie inclusief die van de subcategorieën. */
export async function getCategoryProducts(categoryIds: string[], lang: Lang) {
  const rows = await db.product.findMany({
    where: { published: true, categories: { some: { id: { in: categoryIds } } } },
    orderBy: [{ sortOrder: "asc" }],
    include: { variants: { select: { available: true } }, categories: { select: { handle: true } } },
  });
  return rows.map((p) => ({ ...toCard(p, lang), categories: p.categories.map((c) => c.handle) }));
}

export async function getFeaturedProducts(lang: Lang, take = 8) {
  const rows = await db.product.findMany({
    where: { published: true, featured: true },
    orderBy: { sortOrder: "asc" },
    take,
    include: { variants: { select: { available: true } } },
  });
  return rows.map((p) => toCard(p, lang));
}

export async function getProductsInCategory(handle: string, lang: Lang, take = 8) {
  const rows = await db.product.findMany({
    where: { published: true, categories: { some: { handle } } },
    orderBy: { sortOrder: "asc" },
    take,
    include: { variants: { select: { available: true } } },
  });
  return rows.map((p) => toCard(p, lang));
}

export async function getProduct(handle: string) {
  return db.product.findFirst({
    where: { published: true, OR: [{ handle }, { handleEn: handle }] },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      categories: { where: { published: true }, orderBy: { sortOrder: "asc" } },
      reviews: { where: { published: true }, orderBy: { date: "desc" } },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryIds: string[], lang: Lang, take = 4) {
  const rows = await db.product.findMany({
    where: { published: true, id: { not: productId }, categories: { some: { id: { in: categoryIds } } } },
    orderBy: { sortOrder: "asc" },
    take,
    include: { variants: { select: { available: true } } },
  });
  return rows.map((p) => toCard(p, lang));
}

export async function searchProducts(q: string, lang: Lang) {
  const rows = await db.product.findMany({
    where: { published: true },
    include: { variants: { select: { available: true } } },
    orderBy: { sortOrder: "asc" },
  });
  const needle = q.toLowerCase();
  return rows
    .filter((p) => [t(p.title, "it"), t(p.title, "en"), p.productType ?? "", JSON.stringify(p.tags ?? [])].join(" ").toLowerCase().includes(needle))
    .map((p) => toCard(p, lang));
}

export const getPage = cache(async (handle: string) =>
  db.page.findFirst({ where: { published: true, OR: [{ handle }, { handleEn: handle }] } }),
);

export function pageHref(p: { handle: string; handleEn: string | null }, lang: Lang) {
  return localePath(lang, `/pages/${lang === "en" && p.handleEn ? p.handleEn : p.handle}`);
}

export async function getFeaturedReviews(take = 8) {
  return db.review.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { date: "desc" }], take });
}

export async function getPaymentMethods() {
  return db.paymentMethod.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } });
}
