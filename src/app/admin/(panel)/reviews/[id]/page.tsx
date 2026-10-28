import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReviewForm } from "@/components/admin/forms/ReviewForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { PageHeader, btnSmDanger, tr } from "@/components/admin/ui";
import { deleteReview } from "@/app/admin/actions/reviews";

export const metadata = { title: "Review bewerken" };

export default async function ReviewEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const isNew = id === "nieuw";
  const [review, products] = await Promise.all([
    isNew ? null : db.review.findUnique({ where: { id } }),
    db.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
  ]);
  if (!isNew && !review) notFound();

  return (
    <>
      <PageHeader
        title={review ? `Review van ${review.author}` : "Nieuwe review"}
        description={
          <Link href="/admin/reviews" className="hover:text-forest">
            ← Alle reviews
          </Link>
        }
        action={
          review && (
            <form action={deleteReview}>
              <input type="hidden" name="id" value={review.id} />
              <SubmitButton className={btnSmDanger} confirm="Review verwijderen?">
                Verwijderen
              </SubmitButton>
            </form>
          )
        }
      />
      <ReviewForm
        products={products.map((p) => ({ id: p.id, label: tr(p.title) }))}
        review={{
          id: review?.id,
          author: review?.author ?? "",
          rating: review?.rating ?? 5,
          text: review?.text ?? "",
          date: (review?.date ?? new Date()).toISOString().slice(0, 10),
          productName: review?.productName ?? "",
          productId: review?.productId ?? "",
          published: review?.published ?? true,
          featured: review?.featured ?? false,
        }}
      />
    </>
  );
}
