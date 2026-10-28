"use client";

import { useState } from "react";
import { saveProduct } from "@/app/admin/actions/products";
import { FormMessage } from "../FormMessage";
import { ImageListEditor, move, type Img } from "../ImageListEditor";
import { LangTabs } from "../LangTabs";
import { SubmitButton } from "../SubmitButton";
import { useAdminForm } from "../useAdminForm";
import { Label, Panel, btnSm, fieldSm } from "../ui";

type L = { it?: string; en?: string } | null;
export type VariantRow = { id?: string; title: string; sku: string; price: string; compare: string; available: boolean };
export type ProductFormData = {
  id?: string;
  handle: string;
  handleEn: string;
  title: L;
  body: L;
  images: Img[];
  variants: VariantRow[];
  categoryIds: string[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export function ProductForm({ product, categories }: { product: ProductFormData; categories: { id: string; label: string; depth: number; group: string }[] }) {
  const { state, pending, onSubmit } = useAdminForm(saveProduct);
  const [images, setImages] = useState<Img[]>(product.images);
  const [variants, setVariants] = useState<VariantRow[]>(product.variants);
  const setVariant = (i: number, patch: Partial<VariantRow>) => setVariants((vs) => vs.map((v, k) => (k === i ? { ...v, ...patch } : v)));

  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      {product.id && <input type="hidden" name="id" value={product.id} />}
      <div className="lg:col-span-2">
        <FormMessage state={state} />
      </div>

      <div className="grid min-w-0 content-start gap-6">
        <Panel title="Inhoud">
          <LangTabs
            render={(l) => (
              <div className="grid gap-4">
                <label>
                  <Label>Titel {l === "it" && "*"}</Label>
                  <input name={`title_${l}`} defaultValue={product.title?.[l] ?? ""} className="field" required={l === "it"} />
                </label>
                <label>
                  <Label hint="(HTML)">Beschrijving</Label>
                  <textarea name={`body_${l}`} defaultValue={product.body?.[l] ?? ""} rows={14} className="field font-mono text-xs" />
                </label>
              </div>
            )}
          />
        </Panel>

        <Panel title="Afbeeldingen">
          <p className="mb-3 text-xs text-muted">De eerste afbeelding is de hoofdafbeelding.</p>
          <ImageListEditor value={images} onChange={setImages} />
        </Panel>

        <Panel title="Varianten">
          <p className="mb-3 text-xs text-muted">Prijzen in euro (komma of punt). De productprijs wordt na opslaan gelijkgezet aan de goedkoopste variant.</p>
          <div className="grid gap-2">
            {variants.map((v, i) => (
              <div key={v.id ?? `n${i}`} className="grid gap-2 rounded-xl border border-line bg-paper/40 p-3 sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_auto] sm:items-end">
                <label>
                  <Label>Titel</Label>
                  <input value={v.title} onChange={(e) => setVariant(i, { title: e.target.value })} className={fieldSm} placeholder="Default Title" />
                </label>
                <label>
                  <Label>SKU</Label>
                  <input value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} className={fieldSm} />
                </label>
                <label>
                  <Label>Prijs €</Label>
                  <input value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} className={fieldSm} inputMode="decimal" placeholder="0,00" />
                </label>
                <label>
                  <Label>Was €</Label>
                  <input value={v.compare} onChange={(e) => setVariant(i, { compare: e.target.value })} className={fieldSm} inputMode="decimal" placeholder="–" />
                </label>
                <div className="flex items-center gap-1 pb-1">
                  <label className="mr-2 flex items-center gap-1.5 text-xs" title="Beschikbaar">
                    <input type="checkbox" checked={v.available} onChange={(e) => setVariant(i, { available: e.target.checked })} className="h-4 w-4 accent-leaf" /> Op voorraad
                  </label>
                  <button type="button" className={btnSm} disabled={i === 0} onClick={() => setVariants((vs) => move(vs, i, -1))} title="Omhoog">
                    ↑
                  </button>
                  <button type="button" className={btnSm} disabled={i === variants.length - 1} onClick={() => setVariants((vs) => move(vs, i, 1))} title="Omlaag">
                    ↓
                  </button>
                  <button
                    type="button"
                    className={`${btnSm} text-clay`}
                    disabled={variants.length <= 1}
                    onClick={() => setVariants((vs) => vs.filter((_, k) => k !== i))}
                    title="Verwijderen"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${btnSm} mt-3`}
            onClick={() => setVariants((vs) => [...vs, { title: "", sku: "", price: vs[vs.length - 1]?.price ?? "", compare: "", available: true }])}
          >
            + Variant toevoegen
          </button>
        </Panel>
      </div>

      <div className="grid content-start gap-6">
        <Panel title="Publicatie">
          <div className="grid gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="published" defaultChecked={product.published} className="h-4 w-4 accent-leaf" /> Gepubliceerd
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="featured" defaultChecked={product.featured} className="h-4 w-4 accent-leaf" /> Uitgelicht
            </label>
            <label>
              <Label>Volgorde</Label>
              <input name="sortOrder" type="number" defaultValue={product.sortOrder} className={fieldSm} />
            </label>
            <SubmitButton pending={pending} pendingText="Opslaan…" className="btn-primary w-full">
              Opslaan
            </SubmitButton>
          </div>
        </Panel>
        <Panel title="URL">
          <div className="grid gap-3">
            <label>
              <Label>Handle IT *</Label>
              <input name="handle" defaultValue={product.handle} className={fieldSm} required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
            </label>
            <label>
              <Label hint="(optioneel)">Handle EN</Label>
              <input name="handleEn" defaultValue={product.handleEn} className={fieldSm} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
            </label>
          </div>
        </Panel>
        <Panel title="Categorieën">
          <div className="grid max-h-96 gap-1 overflow-y-auto text-sm">
            {categories.map((c, i) => (
              <div key={c.id}>
                {(i === 0 || categories[i - 1].group !== c.group) && (
                  <p className="mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted first:mt-0">
                    {c.group === "company" ? "Shop Aziende" : "Shop Privati"}
                  </p>
                )}
                <label className="flex items-start gap-2 py-0.5" style={{ paddingLeft: c.depth * 16 }}>
                  <input type="checkbox" name="categoryIds" value={c.id} defaultChecked={product.categoryIds.includes(c.id)} className="mt-0.5 h-4 w-4 shrink-0 accent-leaf" />
                  {c.label}
                </label>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </form>
  );
}
