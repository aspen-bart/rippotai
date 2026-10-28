import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CategoryForm, type CategoryFormData } from "@/components/admin/forms/CategoryForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { PageHeader, btnSmDanger, tr } from "@/components/admin/ui";
import { deleteCategory } from "@/app/admin/actions/categories";

export const metadata = { title: "Categorie bewerken" };

type L = { it?: string; en?: string };

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const isNew = id === "nieuw";
  const cat = isNew ? null : await db.category.findUnique({ where: { id }, include: { _count: { select: { products: true, children: true } } } });
  if (!isNew && !cat) notFound();

  const all = await db.category.findMany({ orderBy: [{ group: "desc" }, { sortOrder: "asc" }], select: { id: true, title: true, parentId: true, group: true } });
  // Eigen categorie en nakomelingen uitsluiten als mogelijke parent.
  const excluded = new Set<string>();
  if (cat) {
    const walk = (pid: string) => {
      excluded.add(pid);
      all.filter((c) => c.parentId === pid).forEach((c) => walk(c.id));
    };
    walk(cat.id);
  }
  const parents = all
    .filter((c) => !excluded.has(c.id))
    .map((c) => ({ id: c.id, label: `${c.group === "company" ? "Aziende" : "Privati"} · ${tr(c.title)}` }));

  const data: CategoryFormData = cat
    ? {
        id: cat.id,
        handle: cat.handle,
        group: cat.group,
        parentId: cat.parentId,
        title: cat.title as L,
        tagline: (cat.tagline as L | null) ?? null,
        description: cat.description as L,
        image: cat.image,
        sortOrder: cat.sortOrder,
        published: cat.published,
      }
    : { handle: "", group: "private", parentId: null, title: null, tagline: null, description: null, image: null, sortOrder: 0, published: true };

  return (
    <>
      <PageHeader
        title={cat ? tr(cat.title) : "Nieuwe categorie"}
        description={
          <Link href="/admin/shop/categorieen" className="hover:text-forest">
            ← Alle categorieën
          </Link>
        }
        action={
          cat && (
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={cat.id} />
              <SubmitButton
                className={btnSmDanger}
                confirm={`Categorie verwijderen? ${cat._count.products} productkoppeling(en) vervallen; ${cat._count.children} subcategorie(ën) worden hoofdcategorie.`}
              >
                Verwijderen
              </SubmitButton>
            </form>
          )
        }
      />
      <CategoryForm category={data} parents={parents} />
    </>
  );
}
