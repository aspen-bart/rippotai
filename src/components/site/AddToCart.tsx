"use client";

import { useMemo, useState } from "react";
import type { Dict } from "@/lib/dictionaries";
import { useStore } from "./StoreProvider";
import { IconBag, IconMinus, IconPlus } from "./icons";

type Variant = { id: string; title: string; priceCents: number; compareCents: number | null; available: boolean; options: string[] };

export function AddToCart({
  product,
  options,
  variants,
  dict,
}: {
  product: { id: string; title: string; href: string; image: string | null };
  options: { name: string; values: string[] }[];
  variants: Variant[];
  dict: Dict["product"];
}) {
  const { add, money } = useStore();
  const first = variants.find((v) => v.available) ?? variants[0];
  const [selected, setSelected] = useState<string[]>(first?.options ?? []);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => (options.length ? variants.find((v) => options.every((_, i) => v.options[i] === selected[i])) : variants[0]) ?? first,
    [options, variants, selected, first],
  );
  if (!variant) return null;

  const onAdd = () => {
    add({
      productId: product.id,
      variantId: variant.id,
      href: product.href,
      title: product.title,
      variantTitle: variant.title === "Default Title" ? null : variant.title,
      priceCents: variant.priceCents,
      image: product.image,
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mt-8 space-y-6">
      {options.map((o, i) => (
        <fieldset key={o.name}>
          <legend className="mb-3 text-sm text-muted">
            {o.name}: <span className="font-medium text-forest">{selected[i]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {o.values.map((val) => {
              const possible = variants.some((v) => v.options[i] === val && v.available);
              const active = selected[i] === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelected((s) => s.map((x, j) => (j === i ? val : x)))}
                  className={`rounded-full border px-4 py-2 text-sm transition ${active ? "border-forest bg-forest text-paper" : "border-line bg-white text-forest hover:border-forest"} ${possible ? "" : "line-through opacity-40"}`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {variants.length > 1 && <p className="text-sm text-muted">{money(variant.priceCents)}</p>}

      <div className="flex gap-3">
        <div className="flex items-center rounded-full border border-line bg-white" aria-label={dict.quantity}>
          <button type="button" className="p-3.5" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-">
            <IconMinus />
          </button>
          <span className="w-8 text-center">{qty}</span>
          <button type="button" className="p-3.5" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="+">
            <IconPlus />
          </button>
        </div>
        <button type="button" onClick={onAdd} disabled={!variant.available} className={`btn flex-1 ${added ? "bg-leaf text-white" : "bg-forest text-paper hover:bg-leaf-dark"}`}>
          <IconBag width={18} height={18} />
          {!variant.available ? dict.soldOut : added ? dict.added : dict.addToCart}
        </button>
      </div>
    </div>
  );
}
