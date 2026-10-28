import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/admin/money";
import { Thumb } from "@/components/admin/ImageInput";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Badge, Empty, Notice, PageHeader, fieldSm, tr } from "@/components/admin/ui";
import { toggleProductPublished } from "@/app/admin/actions/products";

export const metadata = { title: "Producten" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; categorie?: string; status?: string; verwijderd?: string }> }) {
  await requireUser();
  const { q = "", categorie = "", status = "", verwijderd } = await searchParams;
  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: {
        ...(categorie ? { categories: { some: { id: categorie } } } : {}),
        ...(status === "live" ? { published: true } : status === "concept" ? { published: false } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { categories: { select: { id: true, title: true } }, _count: { select: { variants: true } } },
    }),
    db.category.findMany({ orderBy: [{ group: "desc" }, { sortOrder: "asc" }], select: { id: true, title: true, group: true } }),
  ]);
  // Titels zijn JSON per taal; met dit aantal producten is filteren in het geheugen prima.
  const needle = q.trim().toLowerCase();
  const list = needle
    ? products.filter((p) => [tr(p.title, "it"), tr(p.title, "en"), p.handle, p.handleEn ?? ""].some((s) => s.toLowerCase().includes(needle)))
    : products;

  return (
    <>
      <PageHeader
        title="Producten"
        description={`${list.length} van ${products.length} producten`}
        action={
          <Link href="/admin/shop/producten/nieuw" className="btn-primary">
            + Nieuw product
          </Link>
        }
      />
      {verwijderd && <Notice>Product verwijderd.</Notice>}
      <form className="mb-5 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Zoeken op titel of handle…" className={`${fieldSm} max-w-xs flex-1`} />
        <select name="categorie" defaultValue={categorie} className={`${fieldSm} w-auto`}>
          <option value="">Alle categorieën</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.group === "company" ? "Aziende · " : ""}
              {tr(c.title)}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={`${fieldSm} w-auto`}>
          <option value="">Alle statussen</option>
          <option value="live">Gepubliceerd</option>
          <option value="concept">Niet gepubliceerd</option>
        </select>
        <button className="btn-primary px-4 py-2">Filter</button>
        {(q || categorie || status) && (
          <Link href="/admin/shop/producten" className="self-center text-sm text-muted hover:text-forest">
            Wissen
          </Link>
        )}
      </form>

      {list.length === 0 ? (
        <Empty>Geen producten gevonden.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paper-2/50 text-left text-xs text-muted">
              <tr>
                <th className="p-3 font-medium">Product</th>
                <th className="hidden p-3 font-medium md:table-cell">Categorieën</th>
                <th className="p-3 font-medium">Prijs</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((p) => {
                const images = (p.images as { src: string }[] | null) ?? [];
                return (
                  <tr key={p.id} className="hover:bg-paper/50">
                    <td className="p-3">
                      <Link href={`/admin/shop/producten/${p.id}`} className="flex items-center gap-3">
                        <Thumb src={images[0]?.src} className="h-12 w-12" />
                        <span className="min-w-0">
                          <span className="line-clamp-2 font-medium text-forest">{tr(p.title)}</span>
                          <span className="block text-xs text-muted">
                            {p._count.variants} variant{p._count.variants === 1 ? "" : "en"} · #{p.sortOrder}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden max-w-60 p-3 text-xs text-muted md:table-cell">{p.categories.map((c) => tr(c.title)).join(", ") || "–"}</td>
                    <td className="whitespace-nowrap p-3">
                      {formatEuro(p.priceCents)}
                      {p.compareCents ? <span className="ml-1 text-xs text-muted line-through">{formatEuro(p.compareCents)}</span> : null}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {p.published ? <Badge tone="success">Live</Badge> : <Badge tone="warning">Concept</Badge>}
                        {p.featured && <Badge tone="brand">Uitgelicht</Badge>}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <form action={toggleProductPublished}>
                        <input type="hidden" name="id" value={p.id} />
                        <SubmitButton className="text-xs text-muted underline-offset-2 hover:text-forest hover:underline">
                          {p.published ? "Verbergen" : "Publiceren"}
                        </SubmitButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
