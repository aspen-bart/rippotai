import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Empty, Notice, PageHeader, fmtDate, tr } from "@/components/admin/ui";

export const metadata = { title: "Pagina's" };

export default async function PagesPage({ searchParams }: { searchParams: Promise<{ verwijderd?: string }> }) {
  await requireUser();
  const { verwijderd } = await searchParams;
  const pages = await db.page.findMany({ orderBy: { handle: "asc" }, select: { id: true, handle: true, handleEn: true, title: true, sections: true, published: true, updatedAt: true } });
  return (
    <>
      <PageHeader
        title="Pagina's"
        description={`${pages.length} pagina's`}
        action={
          <Link href="/admin/paginas/nieuw" className="btn-primary">
            + Nieuwe pagina
          </Link>
        }
      />
      {verwijderd && <Notice>Pagina verwijderd.</Notice>}
      {pages.length === 0 ? (
        <Empty>Nog geen pagina's.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paper-2/50 text-left text-xs text-muted">
              <tr>
                <th className="p-3 font-medium">Titel</th>
                <th className="p-3 font-medium">Handle</th>
                <th className="hidden p-3 font-medium sm:table-cell">Secties IT / EN</th>
                <th className="hidden p-3 font-medium md:table-cell">Gewijzigd</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pages.map((p) => {
                const s = (p.sections as { it?: unknown[]; en?: unknown[] } | null) ?? {};
                return (
                  <tr key={p.id} className="hover:bg-paper/50">
                    <td className="p-3">
                      <Link href={`/admin/paginas/${p.id}`} className="font-medium text-forest hover:text-leaf-dark">
                        {tr(p.title) || p.handle}
                      </Link>
                      {tr(p.title, "en") && tr(p.title, "en") !== tr(p.title) && <span className="block text-xs text-muted">{tr(p.title, "en")}</span>}
                    </td>
                    <td className="p-3 font-mono text-xs text-muted">
                      {p.handle}
                      {p.handleEn && <span className="block">{p.handleEn}</span>}
                    </td>
                    <td className="hidden p-3 text-muted sm:table-cell">
                      {s.it?.length ?? 0} / {s.en?.length ?? 0}
                    </td>
                    <td className="hidden p-3 text-muted md:table-cell">{fmtDate(p.updatedAt)}</td>
                    <td className="p-3">{p.published ? <Badge tone="success">Live</Badge> : <Badge tone="warning">Concept</Badge>}</td>
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
