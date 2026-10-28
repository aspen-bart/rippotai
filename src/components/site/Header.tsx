"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MenuItem } from "@/lib/menu";
import type { Dict } from "@/lib/dictionaries";
import { useStore } from "./StoreProvider";
import { Selectors } from "./Selectors";
import { IconBag, IconChevron, IconClose, IconMenu, IconSearch, IconArrow } from "./icons";
import { localePath } from "@/lib/i18n";

export function Header({ menu, dict, announcement }: { menu: MenuItem[]; dict: Dict; announcement: string }) {
  const { lang, count, setCartOpen } = useStore();
  const pathname = usePathname();
  const isHome = /^\/[a-z]{2}-[a-z]{2}\/?$/.test(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const close = () => setOpen(null);
    const onDoc = (e: MouseEvent) => !(e.target as HTMLElement).closest("header") && close();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", close, { passive: true });
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", close);
      document.removeEventListener("mousedown", onDoc);
    };
  }, []);
  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);

  const transparent = isHome && !scrolled && open === null;
  const enter = (i: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(i);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };

  return (
    <>
      <div className="relative z-50 bg-forest-2 text-paper/90">
        <div className="container-x flex h-9 items-center justify-between gap-4 text-[0.72rem] tracking-[0.14em] uppercase">
          <p className="truncate">{announcement}</p>
          <div className="hidden md:block">
            <Selectors dict={dict} />
          </div>
        </div>
      </div>
      <header
        className={`sticky top-0 z-40 transition-colors duration-500 ${transparent ? "text-paper" : "bg-paper/95 text-forest shadow-[0_1px_0_var(--color-line)] backdrop-blur"} ${isHome ? "-mb-[84px]" : ""}`}
        onMouseLeave={leave}
      >
        <div className={`container-x flex items-center gap-6 transition-all duration-300 ${scrolled ? "h-[68px]" : "h-[84px]"}`}>
          <button className="lg:hidden -ml-1 p-1" onClick={() => setMobile(true)} aria-label={dict.nav.menu}>
            <IconMenu />
          </button>
          <Link href={localePath(lang)} className="shrink-0" aria-label="Rippotai home">
            <Image
              src={transparent ? "/images/brand/logo-white.png" : "/images/brand/logo-green.png"}
              alt="Rippotai"
              width={120}
              height={120}
              priority
              className={`w-auto transition-all duration-300 ${scrolled ? "h-11" : "h-14"}`}
            />
          </Link>

          <nav className="mx-auto hidden lg:block" aria-label="Main">
            <ul className="flex items-center gap-1">
              {menu.map((item, i) => (
                <li key={item.label} onMouseEnter={() => (item.columns ? enter(i) : setOpen(null))}>
                  {item.href ? (
                    <Link href={item.href} className="block rounded-full px-4 py-2 text-[0.95rem] hover:bg-current/10">
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className={`flex items-center gap-1 rounded-full px-4 py-2 text-[0.95rem] transition ${open === i ? "bg-forest text-paper" : "hover:bg-current/10"}`}
                      aria-expanded={open === i}
                      onClick={() => setOpen(open === i ? null : i)}
                    >
                      {item.label}
                      <IconChevron className={`transition ${open === i ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <Link href={localePath(lang, "/search")} className="rounded-full p-2.5 hover:bg-current/10" aria-label={dict.nav.search}>
              <IconSearch />
            </Link>
            <button className="relative rounded-full p-2.5 hover:bg-current/10" onClick={() => setCartOpen(true)} aria-label={dict.nav.cart}>
              <IconBag />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[0.65rem] font-semibold text-white">{count}</span>
              )}
            </button>
          </div>
        </div>

        {/* Mega menu */}
        {open !== null && menu[open]?.columns && (
          <div className="absolute inset-x-0 top-full border-t border-line bg-paper text-forest shadow-2xl shadow-forest/10" onMouseEnter={() => enter(open)}>
            <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
              <div className={`grid gap-8 ${menu[open].columns!.length > 2 ? "grid-cols-3" : menu[open].columns!.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                {menu[open].columns!.map((col) => (
                  <div key={col.title}>
                    {col.href ? (
                      <Link href={col.href} className="eyebrow mb-4 inline-flex items-center gap-2 hover:text-forest">
                        {col.title} <IconArrow width={14} height={14} />
                      </Link>
                    ) : (
                      <p className="eyebrow mb-4">{col.title}</p>
                    )}
                    <ul className={`space-y-1 ${menu[open].columns!.length === 1 ? "grid grid-cols-2 gap-x-8" : ""}`}>
                      {col.items.map((l) => (
                        <li key={l.href + l.label}>
                          <Link href={l.href} className="group flex items-center gap-3 rounded-xl py-1.5 text-[0.98rem] hover:text-leaf-dark">
                            {l.image && (
                              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-paper-2">
                                <Image src={l.image} alt="" fill sizes="40px" className="object-cover transition duration-500 group-hover:scale-110" />
                              </span>
                            )}
                            <span>{l.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {menu[open].feature?.image && (
                <Link href={menu[open].feature!.href} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl max-h-80">
                  <Image src={menu[open].feature!.image!} alt="" fill sizes="320px" className="object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-forest-2/85 via-forest-2/10 to-transparent" />
                  <span className="absolute inset-x-5 bottom-5 text-paper">
                    <span className="block text-xs uppercase tracking-[0.2em] text-sprout">{menu[open].feature!.description}</span>
                    <span className="mt-1 flex items-center gap-2 font-display text-2xl">
                      {menu[open].feature!.label} <IconArrow />
                    </span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobiel menu */}
      <div className={`fixed inset-0 z-[60] lg:hidden ${mobile ? "" : "pointer-events-none"}`} aria-hidden={!mobile}>
        <div className={`absolute inset-0 bg-forest-2/50 transition-opacity ${mobile ? "opacity-100" : "opacity-0"}`} onClick={() => setMobile(false)} />
        <div className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-paper transition-transform duration-300 ${mobile ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Image src="/images/brand/logo-green.png" alt="Rippotai" width={48} height={48} className="h-11 w-auto" />
            <button onClick={() => setMobile(false)} aria-label={dict.nav.close} className="p-1">
              <IconClose />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 py-4">
            {menu.map((item) =>
              item.href ? (
                <Link key={item.label} href={item.href} className="block border-b border-line py-4 font-display text-xl text-forest">
                  {item.label}
                </Link>
              ) : (
                <details key={item.label} className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-display text-xl text-forest">
                    {item.label}
                    <IconChevron className="transition group-open:rotate-180" />
                  </summary>
                  <div className="space-y-4 pb-5">
                    {item.columns!.map((col) => (
                      <div key={col.title}>
                        {col.href ? (
                          <Link href={col.href} className="eyebrow">
                            {col.title}
                          </Link>
                        ) : (
                          <p className="eyebrow">{col.title}</p>
                        )}
                        <ul className="mt-2 space-y-2">
                          {col.items.map((l) => (
                            <li key={l.href + l.label}>
                              <Link href={l.href} className="text-[0.98rem] text-ink/80">
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              ),
            )}
          </nav>
          <div className="border-t border-line bg-forest-2 px-5 py-4 text-paper">
            <Selectors dict={dict} up />
          </div>
        </div>
      </div>
    </>
  );
}
