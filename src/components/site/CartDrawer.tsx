"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import type { Dict } from "@/lib/dictionaries";
import { localePath } from "@/lib/i18n";
import { useStore } from "./StoreProvider";
import { IconClose, IconMinus, IconPlus, IconSeed } from "./icons";

export function CartDrawer({ dict }: { dict: Dict }) {
  const { lang, items, cartOpen, setCartOpen, setQty, remove, subtotalCents, money, currency } = useStore();

  useEffect(() => {
    document.documentElement.style.overflow = cartOpen ? "hidden" : "";
  }, [cartOpen]);

  return (
    <div className={`fixed inset-0 z-[80] ${cartOpen ? "" : "pointer-events-none"}`} aria-hidden={!cartOpen}>
      <div className={`absolute inset-0 bg-forest-2/50 backdrop-blur-[2px] transition-opacity duration-300 ${cartOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setCartOpen(false)} />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label={dict.cart.title}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl text-forest">{dict.cart.title}</h2>
          <button onClick={() => setCartOpen(false)} aria-label={dict.nav.close} className="rounded-full p-2 hover:bg-paper-2">
            <IconClose />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-paper-2 text-leaf">
              <IconSeed width={36} height={36} />
            </span>
            <p className="font-display text-xl text-forest">{dict.cart.empty}</p>
            <Link href={localePath(lang, "/collections/cartoleria-ecologica-e-piantabile")} className="btn-primary" onClick={() => setCartOpen(false)}>
              {dict.cart.emptyCta}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((it) => (
                <li key={it.variantId} className="flex gap-4 py-5">
                  <Link href={it.href} onClick={() => setCartOpen(false)} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                    {it.image && <Image src={it.image} alt="" fill sizes="80px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={it.href} onClick={() => setCartOpen(false)} className="line-clamp-2 text-sm font-medium text-forest">
                      {it.title}
                    </Link>
                    {it.variantTitle && <p className="mt-0.5 text-xs text-muted">{it.variantTitle}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-line">
                        <button className="p-2" onClick={() => setQty(it.variantId, it.qty - 1)} aria-label="-">
                          <IconMinus />
                        </button>
                        <span className="w-6 text-center text-sm">{it.qty}</span>
                        <button className="p-2" onClick={() => setQty(it.variantId, it.qty + 1)} aria-label="+">
                          <IconPlus />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{money(it.priceCents * it.qty)}</p>
                        <button className="text-xs text-muted underline" onClick={() => remove(it.variantId)}>
                          {dict.cart.remove}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-line bg-paper-2/60 px-6 py-5">
              <div className="flex justify-between text-sm">
                <span>{dict.cart.subtotal}</span>
                <span className="font-medium">{money(subtotalCents)}</span>
              </div>
              {currency.code !== "EUR" && <p className="text-xs text-muted">{dict.cart.note}</p>}
              <Link href={localePath(lang, "/checkout")} className="btn-primary w-full" onClick={() => setCartOpen(false)}>
                {dict.cart.checkout}
              </Link>
              <button className="w-full text-center text-sm text-forest underline underline-offset-4" onClick={() => setCartOpen(false)}>
                {dict.cart.continue}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
