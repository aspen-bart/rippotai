import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Thumb } from "@/components/admin/ImageInput";
import { Badge, Notice, PageHeader, Panel, tr } from "@/components/admin/ui";

export const metadata = { title: "Categorieën" };

type Cat = { id: string; handle: string; group: string; title: unknown; image: string | null; published: boolean; sortOrder: number; parentId: string | null; _count: { products: number } };

function Tree({ items, parentId, depth }: { items: Cat[]; parentId: string | null; depth: number }) {
  const children = items.filter((c) => c.parentId === parentId);
  if (!children.length) return null;
  return (
    <ul className={depth ? "ml-6 border-l border-line pl-4" : "divide-y divide-line"}>
      {children.map((c) => (
        <li key={c.id} className="py-1">
          <Link href={`/admin/shop/categorieen/${c.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-paper">
            <Thumb src={c.image} className="h-10 w-10" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-forest">{tr(c.title)}</span>
              <span className="block truncate text-xs text-muted">/{c.handle}</span>
            </span>
            <span className="hidden text-xs text-muted sm:inline">{c._count.products} producten</span>
            <span className="text-xs text-muted">#{c.sortOrder}</span>
            {!c.published && <Badge tone="warning">Verborgen</Badge>}
          </Link>
          <Tree items={items} parentId={c.id} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ verwijderd?: string }> }) {
  await requireUser();
  const { verwijderd } = await searchParams;
  const cats = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, handle: true, group: true, title: true, image: true, published: true, sortOrder: true, parentId: true, _count: { select: { products: true } } },
  });
  // Categorieën waarvan de parent een andere groep heeft, tonen we toch onder hun parent; wezen (parent niet gevonden) op topniveau.
  const ids = new Set(cats.map((c) => c.id));
  const norm = cats.map((c) => ({ ...c, parentId: c.parentId && ids.has(c.parentId) ? c.parentId : null }));
  const groups = [
    { key: "private", label: "Shop Privati" },
    { key: "company", label: "Shop Aziende" },
  ];
  return (
    <>
      <PageHeader
        title="Categorieën"
        description={`${cats.length} categorieën`}
        action={
          <Link href="/admin/shop/categorieen/nieuw" className="btn-primary">
            + Nieuwe categorie
          </Link>
        }
      />
      {verwijderd && <Notice>Categorie verwijderd.</Notice>}
      <div className="grid gap-6">
        {groups.map((g) => {
          const roots = norm.filter((c) => c.parentId === null && (c.group === g.key || (g.key === "private" && c.group !== "company")));
          const inGroup = new Set<string>();
          const collect = (id: string) => {
            inGroup.add(id);
            norm.filter((c) => c.parentId === id).forEach((c) => collect(c.id));
          };
          roots.forEach((r) => collect(r.id));
          const items = norm.filter((c) => inGroup.has(c.id));
          return (
            <Panel key={g.key} title={g.label}>
              {items.length ? <Tree items={items} parentId={null} depth={0} /> : <p className="text-sm text-muted">Geen categorieën.</p>}
            </Panel>
          );
        })}
      </div>
    </>
  );
}
