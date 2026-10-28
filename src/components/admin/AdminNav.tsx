"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; exact?: boolean; badge?: number };
type Group = { title?: string; items: Item[] };

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  const groups: Group[] = [
    { items: [{ href: "/admin", label: "Dashboard", exact: true }] },
    {
      title: "Shop",
      items: [
        { href: "/admin/shop/producten", label: "Producten" },
        { href: "/admin/shop/categorieen", label: "Categorieën" },
        { href: "/admin/bestellingen", label: "Bestellingen" },
        { href: "/admin/reviews", label: "Reviews" },
      ],
    },
    {
      title: "Inhoud",
      items: [
        { href: "/admin/paginas", label: "Pagina's" },
        { href: "/admin/berichten", label: "Berichten", badge: unread },
      ],
    },
    {
      title: "Instellingen",
      items: [
        { href: "/admin/whatsapp", label: "WhatsApp" },
        { href: "/admin/betaalmethoden", label: "Betaalmethoden" },
        { href: "/admin/instellingen", label: "Winkel & valuta" },
      ],
    },
  ];
  return (
    <nav className="mt-4 -mx-1 flex gap-1 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:gap-5 lg:overflow-visible" aria-label="Beheermenu">
      {groups.map((g, i) => (
        <div key={i} className="flex shrink-0 gap-1 lg:flex-col">
          {g.title && <p className="hidden px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/40 lg:block">{g.title}</p>}
          {g.items.map(({ href, label, exact, badge }) => {
            const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition ${
                  active ? "bg-paper/10 font-medium text-paper" : "text-paper/70 hover:bg-paper/5 hover:text-paper"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-sprout" : "bg-paper/20"}`} />
                  {label}
                </span>
                {!!badge && <span className="rounded-full bg-clay px-1.5 text-[10px] font-semibold text-white">{badge}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
