import Link from "next/link";
import Image from "next/image";
import type { ProductCardView } from "@/lib/catalog";
import { Price } from "./StoreProvider";
import { IconArrow } from "./icons";

export function ProductCard({ p, soldOut, priority }: { p: ProductCardView; soldOut: string; priority?: boolean }) {
  return (
    <Link href={p.href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-white">
        {p.image && (
          <Image
            src={p.image.src}
            alt={p.image.alt}
            fill
            priority={priority}
            sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className={`object-cover transition duration-700 ease-out group-hover:scale-[1.04] ${p.hoverImage ? "group-hover:opacity-0" : ""}`}
          />
        )}
        {p.hoverImage && (
          <Image src={p.hoverImage.src} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="scale-[1.04] object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100" />
        )}
        {!p.available && <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[0.68rem] uppercase tracking-wider text-paper">{soldOut}</span>}
        {p.badge === "sale" && <span className="absolute left-3 top-3 rounded-full bg-clay px-3 py-1 text-[0.68rem] uppercase tracking-wider text-white">Sale</span>}
        <span className="absolute bottom-3 right-3 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-paper text-forest opacity-0 shadow-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <IconArrow />
        </span>
      </div>
      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 text-[0.98rem] leading-snug text-forest group-hover:text-leaf-dark">{p.title}</h3>
        <Price cents={p.priceCents} compareCents={p.compareCents} className="mt-1 block text-sm text-muted" />
      </div>
    </Link>
  );
}
