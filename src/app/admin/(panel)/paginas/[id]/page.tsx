import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageForm, type PageFormData, type Section } from "@/components/admin/forms/PageForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { PageHeader, btnSm, btnSmDanger, tr } from "@/components/admin/ui";
import { deletePage } from "@/app/admin/actions/pages";

export const metadata = { title: "Pagina bewerken" };

type L = { it?: string; en?: string };

function normSections(v: unknown): Section[] {
  if (!Array.isArray(v)) return [];
  return v.map((s: Partial<Section>) => ({
    html: typeof s?.html === "string" ? s.html : "",
    images: Array.isArray(s?.images) ? s.images.map((i) => ({ src: i?.src ?? "", alt: i?.alt ?? "" })) : [],
    ctas: Array.isArray(s?.ctas) ? s.ctas.map((c) => ({ label: c?.label ?? "", href: c?.href ?? "" })) : [],
  }));
}

export default async function PageEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const isNew = id === "nieuw";
  const page = isNew ? null : await db.page.findUnique({ where: { id } });
  if (!isNew && !page) notFound();

  const sections = (page?.sections as { it?: unknown; en?: unknown } | null) ?? {};
  const data: PageFormData = page
    ? {
        id: page.id,
        handle: page.handle,
        handleEn: page.handleEn ?? "",
        title: page.title as L,
        description: page.description as L,
        sections: { it: normSections(sections.it), en: normSections(sections.en) },
        published: page.published,
      }
    : { handle: "", handleEn: "", title: null, description: null, sections: { it: [{ html: "", images: [], ctas: [] }], en: [] }, published: true };

  return (
    <>
      <PageHeader
        title={page ? tr(page.title) || page.handle : "Nieuwe pagina"}
        description={
          <Link href="/admin/paginas" className="hover:text-forest">
            ← Alle pagina&apos;s
          </Link>
        }
        action={
          page && (
            <>
              <a href={`/it-it/pages/${page.handle}`} target="_blank" rel="noreferrer" className={btnSm}>
                Bekijk op site ↗
              </a>
              <form action={deletePage}>
                <input type="hidden" name="id" value={page.id} />
                <SubmitButton className={btnSmDanger} confirm="Pagina definitief verwijderen?">
                  Verwijderen
                </SubmitButton>
              </form>
            </>
          )
        }
      />
      <PageForm page={data} />
    </>
  );
}
