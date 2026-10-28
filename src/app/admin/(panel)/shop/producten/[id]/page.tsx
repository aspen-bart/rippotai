import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { centsToInput } from "@/lib/admin/money";
import { flattenCategoryTree } from "@/lib/admin/category-tree";
import { ProductForm, type ProductFormData } from "@/components/admin/forms/ProductForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { PageHeader, btnSm, btnSmDanger, tr } from "@/components/admin/ui";
import { deleteProduct } from "@/app/admin/actions/products";

export const metadata = { title: "Product bewerken" };

type L = { it?: string; en?: string };

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const isNew = id === "nieuw";
  const [product, cats] = await Promise.all([
    isNew
      ? null
      : db.product.findUnique({ where: { id }, include: { variants: { orderBy: { sortOrder: "asc" } }, categories: { select: { id: true } } } }),
    db.category.findMany({ select: { id: true, title: true, parentId: true, group: true, sortOrder: true } }),
  ]);
  if (!isNew && !product) notFound();

  const data: ProductFormData = product
    ? {
        id: product.id,
        handle: product.handle,
        handleEn: product.handleEn ?? "",
        title: product.title as L,
        body: product.body as L,
        images: ((product.images as { src?: string; alt?: string }[] | null) ?? []).map((i) => ({ src: i.src ?? "", alt: i.alt ?? "" })),
        variants: product.variants.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku ?? "",
          price: centsToInput(v.priceCents),
          compare: centsToInput(v.compareCents),
          available: v.available,
        })),
        categoryIds: product.categories.map((c) => c.id),
        featured: product.featured,
        published: product.published,
        sortOrder: product.sortOrder,
      }
    : {
        handle: "",
        handleEn: "",
        title: null,
        body: null,
        images: [],
        variants: [{ title: "Default Title", sku: "", price: "", compare: "", available: true }],
        categoryIds: [],
        featured: false,
        published: true,
        sortOrder: 0,
      };

  return (
    <>
      <PageHeader
        title={product ? tr(product.title) : "Nieuw product"}
        description={
          <Link href="/admin/shop/producten" className="hover:text-forest">
            ← Alle producten
          </Link>
        }
        action={
          product && (
            <>
              <a href={`/it-it/products/${product.handle}`} target="_blank" rel="noreferrer" className={btnSm}>
                Bekijk op site ↗
              </a>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={product.id} />
                <SubmitButton className={btnSmDanger} confirm="Product definitief verwijderen? Varianten worden ook verwijderd.">
                  Verwijderen
                </SubmitButton>
              </form>
            </>
          )
        }
      />
      <ProductForm product={data} categories={flattenCategoryTree(cats)} />
    </>
  );
}
