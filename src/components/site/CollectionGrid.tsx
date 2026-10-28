"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductCardView } from "@/lib/catalog";
import type { Dict } from "@/lib/dictionaries";
import { ProductCard } from "./ProductCard";
import { IconArrow, IconSeed } from "./icons";

type P = ProductCardView & { categories: string[] };
type Sort = "featured" | "asc" | "desc" | "name";

export function CollectionGrid({
  products,
  filters,
  dict,
  soldOut,
  story,
  business,
}: {
  products: P[];
  filters: { handle: string; title: string }[];
  dict: Dict["collection"];
  soldOut: string;
  story: { title: string; text: string; image: string };
  business: { title: string; text: string; cta: string; href: string };
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("featured");

  const list = useMemo(() => {
    const l = filter ? products.filter((p) => p.categories.includes(filter)) : [...products];
    if (sort === "asc") l.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "desc") l.sort((a, b) => b.priceCents - a.priceCents);
    if (sort === "name") l.sort((a, b) => a.title.localeCompare(b.title));
    return l;
  }, [products, filter, sort]);

  const usedFilters = filters.filter((f) => products.some((p) => p.categories.includes(f.handle)));

  return (
    <div>
      <div className="sticky top-[68px] z-20 -mx-4 mb-8 flex flex-wrap items-center justify-between gap-3 bg-paper/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {usedFilters.length > 1 && (
            <>
              <FilterPill active={!filter} onClick={() => setFilter(null)}>
                {dict.all} <span className="opacity-60">{products.length}</span>
              </FilterPill>
              {usedFilters.map((f) => (
                <FilterPill key={f.handle} active={filter === f.handle} onClick={() => setFilter(f.handle)}>
                  {f.title} <span className="opacity-60">{products.filter((p) => p.categories.includes(f.handle)).length}</span>
                </FilterPill>
              ))}
            </>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          {dict.sort}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full border border-line bg-white px-4 py-2 text-forest outline-none focus:border-leaf">
            <option value="featured">{dict.sortFeatured}</option>
            <option value="asc">{dict.sortPriceAsc}</option>
            <option value="desc">{dict.sortPriceDesc}</option>
            <option value="name">{dict.sortName}</option>
          </select>
        </label>
      </div>

      <ul className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {list.map((p, i) => (
          <Fragmentish key={p.id}>
            {i === 3 && !filter && (
              <li className="col-span-2 md:col-span-1">
                <div className="relative flex h-full min-h-[320px] flex-col justify-end overflow-hidden rounded-[1.4rem] bg-forest p-6 text-paper">
                  <Image src={story.image} alt="" fill sizes="25vw" className="object-cover opacity-40" />
                  <span className="relative grid h-12 w-12 place-items-center rounded-full bg-sprout text-forest-2">
                    <IconSeed />
                  </span>
                  <p className="relative mt-4 font-display text-2xl leading-tight">{story.title}</p>
                  <p className="relative mt-2 text-sm text-paper/80">{story.text}</p>
                </div>
              </li>
            )}
            <li>
              <ProductCard p={p} soldOut={soldOut} priority={i < 4} />
            </li>
            {i === 9 && !filter && (
              <li className="col-span-2">
                <Link href={business.href} className="group flex h-full min-h-[260px] flex-col justify-between rounded-[1.4rem] bg-kraft p-8 text-forest paper-grain">
                  <p className="eyebrow">Shop Aziende</p>
                  <div>
                    <p className="font-display text-3xl leading-tight md:text-4xl">{business.title}</p>
                    <p className="mt-2 max-w-md text-forest/80">{business.text}</p>
                    <span className="mt-5 inline-flex items-center gap-2 font-medium underline decoration-2 underline-offset-4">
                      {business.cta} <IconArrow className="transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </li>
            )}
          </Fragmentish>
        ))}
      </ul>
    </div>
  );
}

function Fragmentish({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition ${active ? "border-forest bg-forest text-paper" : "border-line bg-white text-forest hover:border-forest"}`}>
      {children}
    </button>
  );
}
