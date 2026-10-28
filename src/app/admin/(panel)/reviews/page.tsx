import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Empty, Notice, PageHeader, fmtDate, tr } from "@/components/admin/ui";
import { toggleReview } from "@/app/admin/actions/reviews";

export const metadata = { title: "Reviews" };

function Toggle({ id, field, on, label }: { id: string; field: "published" | "featured"; on: boolean; label: string }) {
  return (
    <form action={toggleReview}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <SubmitButton
        title={`${label} ${on ? "uitzetten" : "aanzetten"}`}
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${on ? "bg-leaf/15 text-leaf-dark hover:bg-leaf/25" : "bg-paper-2 text-muted hover:bg-line"}`}
      >
        {on ? "✓ " : ""}
        {label}
      </SubmitButton>
    </form>
  );
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ opgeslagen?: string; verwijderd?: string }> }) {
  await requireUser();
  const { opgeslagen, verwijderd } = await searchParams;
  const reviews = await db.review.findMany({ orderBy: { date: "desc" }, include: { product: { select: { title: true } } } });
  return (
    <>
      <PageHeader
        title="Reviews"
        description={`${reviews.length} reviews`}
        action={
          <Link href="/admin/reviews/nieuw" className="btn-primary">
            + Nieuwe review
          </Link>
        }
      />
      {opgeslagen && <Notice>Review opgeslagen.</Notice>}
      {verwijderd && <Notice>Review verwijderd.</Notice>}
      {reviews.length === 0 ? (
        <Empty>Nog geen reviews.</Empty>
      ) : (
        <div className="grid gap-3">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-forest">
                    {r.author} <span className="ml-1 text-sun">{"★".repeat(r.rating)}</span>
                    <span className="text-line">{"★".repeat(5 - r.rating)}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {fmtDate(r.date)}
                    {(r.product || r.productName) && <> · {r.product ? tr(r.product.title) : r.productName}</>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Toggle id={r.id} field="published" on={r.published} label="Gepubliceerd" />
                  <Toggle id={r.id} field="featured" on={r.featured} label="Uitgelicht" />
                  <Link href={`/admin/reviews/${r.id}`} className="ml-1 text-xs text-muted underline-offset-2 hover:text-forest hover:underline">
                    Bewerken
                  </Link>
                </div>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-ink/80">{r.text}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
