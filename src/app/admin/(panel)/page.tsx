import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/admin/money";
import { Badge, Empty, OrderStatusBadge, PageHeader, Panel, fmtDateTime } from "@/components/admin/ui";

export default async function Dashboard() {
  const session = await requireUser();
  const [products, categories, pages, orders, unread, reviews, subscribers, lastOrders, lastMessages] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.page.count(),
    db.order.count(),
    db.contactMessage.count({ where: { read: false } }),
    db.review.count(),
    db.newsletterSubscriber.count(),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  const tiles = [
    { label: "Producten", value: products, href: "/admin/shop/producten" },
    { label: "Categorieën", value: categories, href: "/admin/shop/categorieen" },
    { label: "Pagina's", value: pages, href: "/admin/paginas" },
    { label: "Bestellingen", value: orders, href: "/admin/bestellingen" },
    { label: "Ongelezen berichten", value: unread, href: "/admin/berichten", alert: unread > 0 },
    { label: "Reviews", value: reviews, href: "/admin/reviews" },
    { label: "Nieuwsbrief", value: subscribers, href: "/admin/berichten#nieuwsbrief" },
  ];
  return (
    <>
      <PageHeader title={`Welkom, ${session.name.split(" ")[0]}`} description="Overzicht van de webshop" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-2xl border border-line bg-white p-4 transition hover:border-leaf">
            <p className={`text-3xl font-semibold ${t.alert ? "text-clay" : "text-forest"}`}>{t.value}</p>
            <p className="mt-1 text-xs text-muted">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Laatste bestellingen">
          {lastOrders.length === 0 ? (
            <Empty>Nog geen bestellingen.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {lastOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/bestellingen/${o.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-leaf-dark">
                    <span className="min-w-0">
                      <span className="font-medium">#{o.number}</span> <span className="text-muted">{o.name}</span>
                      <span className="block text-xs text-muted">{fmtDateTime(o.createdAt)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      {formatEuro(o.totalCents)} <OrderStatusBadge status={o.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Laatste berichten">
          {lastMessages.length === 0 ? (
            <Empty>Nog geen berichten.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {lastMessages.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/berichten#${m.id}`} className="block py-3 text-sm hover:text-leaf-dark">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-medium">{m.name}</span>
                      {!m.read && <Badge tone="danger">Nieuw</Badge>}
                    </span>
                    <span className="line-clamp-1 text-muted">{m.message}</span>
                    <span className="text-xs text-muted">{fmtDateTime(m.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
