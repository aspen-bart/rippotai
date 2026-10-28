"use client";

import { saveReview } from "@/app/admin/actions/reviews";
import { FormMessage } from "../FormMessage";
import { SubmitButton } from "../SubmitButton";
import { useAdminForm } from "../useAdminForm";
import { Label, Panel } from "../ui";

export type ReviewFormData = {
  id?: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  productName: string;
  productId: string;
  published: boolean;
  featured: boolean;
};

export function ReviewForm({ review, products }: { review: ReviewFormData; products: { id: string; label: string }[] }) {
  const { state, pending, onSubmit } = useAdminForm(saveReview);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-6">
      <FormMessage state={state} />
      {review.id && <input type="hidden" name="id" value={review.id} />}
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <Label>Auteur *</Label>
            <input name="author" defaultValue={review.author} className="field" required />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label>
              <Label>Rating *</Label>
              <select name="rating" defaultValue={review.rating} className="field">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)} ({n})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <Label>Datum *</Label>
              <input name="date" type="date" defaultValue={review.date} className="field" required />
            </label>
          </div>
          <label className="sm:col-span-2">
            <Label>Tekst *</Label>
            <textarea name="text" defaultValue={review.text} rows={6} className="field" required />
          </label>
          <label>
            <Label hint="(zoals getoond bij de review)">Productnaam</Label>
            <input name="productName" defaultValue={review.productName} className="field" />
          </label>
          <label>
            <Label hint="(optioneel)">Gekoppeld product</Label>
            <select name="productId" defaultValue={review.productId} className="field">
              <option value="">— geen —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="published" defaultChecked={review.published} className="h-4 w-4 accent-leaf" /> Gepubliceerd
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="featured" defaultChecked={review.featured} className="h-4 w-4 accent-leaf" /> Uitgelicht
            </label>
          </div>
        </div>
      </Panel>
      <div>
        <SubmitButton pending={pending} pendingText="Opslaan…">
          Opslaan
        </SubmitButton>
      </div>
    </form>
  );
}
