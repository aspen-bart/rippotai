"use client";

import { useRef } from "react";
import type { Lang } from "@/lib/i18n";
import { IconArrow, IconStar } from "./icons";

type R = { id: string; author: string; rating: number; text: string; date: string; product: string | null };

export function ReviewsCarousel({ reviews, lang }: { reviews: R[]; lang: Lang }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * Math.min(420, ref.current.clientWidth * 0.8), behavior: "smooth" });
  const fmt = new Intl.DateTimeFormat(lang === "it" ? "it-IT" : "en-GB", { month: "long", year: "numeric" });
  return (
    <div className="relative mt-12">
      <ul ref={ref} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(1rem,calc((100vw-80rem)/2+2rem))] pb-4 [scrollbar-width:none]">
        {reviews.map((r, i) => (
          <li
            key={r.id}
            className={`relative flex w-[85vw] max-w-[400px] shrink-0 snap-start flex-col rounded-[1.6rem] p-7 ${i % 3 === 1 ? "bg-forest text-paper" : i % 3 === 2 ? "bg-kraft/60" : "bg-white"}`}
          >
            <span className="absolute right-6 top-3 font-display text-7xl leading-none opacity-15">&ldquo;</span>
            <div className={`flex gap-0.5 ${i % 3 === 1 ? "text-sun" : "text-clay"}`}>
              {Array.from({ length: 5 }, (_, k) => (
                <IconStar key={k} filled={k < r.rating} />
              ))}
            </div>
            <p className="mt-5 flex-1 font-display text-xl leading-snug">{r.text}</p>
            <div className="mt-6 flex items-center gap-3 text-sm">
              <span className={`grid h-10 w-10 place-items-center rounded-full font-medium ${i % 3 === 1 ? "bg-sprout text-forest-2" : "bg-forest text-paper"}`}>{r.author.charAt(0)}</span>
              <span>
                <span className="block font-medium">{r.author}</span>
                <span className="opacity-60">{fmt.format(new Date(r.date))}</span>
              </span>
            </div>
            {r.product && <p className="mt-3 truncate text-xs opacity-60">{r.product}</p>}
          </li>
        ))}
      </ul>
      <div className="container-x mt-6 flex justify-end gap-2">
        <button onClick={() => scroll(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-forest/20 text-forest hover:bg-forest hover:text-paper" aria-label="Previous">
          <IconArrow className="rotate-180" />
        </button>
        <button onClick={() => scroll(1)} className="grid h-12 w-12 place-items-center rounded-full border border-forest/20 text-forest hover:bg-forest hover:text-paper" aria-label="Next">
          <IconArrow />
        </button>
      </div>
    </div>
  );
}
