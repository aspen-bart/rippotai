import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/admin/money";
import { Empty, ORDER_STATUSES, OrderStatusBadge, PageHeader, fmtDateTime } from "@/components/admin/ui";

export const metadata = { title: "Bestellingen" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser();
  const { status = "" } = await searchParams;
  const valid = ORDER_STATUSES.some((s) => s.value === status);
  const [orders, counts] = await Promise.all([
    db.order.findMany({ where: valid ? { status } : {}, orderBy: { createdAt: "desc" }, take: 300 }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const total = counts.reduce((a, c) => a + c._count._all, 0);
  const tab = (href: string, active: boolean, label: string, n: number) => (
    <Link
      key={href}
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${active ? "bg-forest text-paper" : "bg-white text-muted hover:text-forest"}`}
    >
      {label} <span className="opacity-60">{n}</span>
    </Link>
  );
  return (
    <>
      <PageHeader title="Bestellingen" description={`${total} bestellingen in totaal`} />
      <div className="mb-5 flex flex-wrap gap-2">
        {tab("/admin/bestellingen", !valid, "Alle", total)}
        {ORDER_STATUSES.map((s) => tab(`/admin/bestellingen?status=${s.value}`, status === s.value, s.label, count(s.value)))}
      </div>
      {orders.length === 0 ? (
        <Empty>Geen bestellingen{valid ? " met deze status" : ""}.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paper-2/50 text-left text-xs text-muted">
              <tr>
                <th className="p-3 font-medium">Nr.</th>
                <th className="p-3 font-medium">Klant</th>
                <th className="hidden p-3 font-medium md:table-cell">Datum</th>
                <th className="hidden p-3 font-medium sm:table-cell">Betaling</th>
                <th className="p-3 text-right font-medium">Totaal</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-paper/50">
                  <td className="p-3">
                    <Link href={`/admin/bestellingen/${o.id}`} className="font-medium text-forest hover:text-leaf-dark">
                      #{o.number}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/bestellingen/${o.id}`} className="block">
                      {o.name}
                      <span className="block text-xs text-muted">{o.email}</span>
                    </Link>
                  </td>
                  <td className="hidden p-3 text-muted md:table-cell">{fmtDateTime(o.createdAt)}</td>
                  <td className="hidden p-3 text-muted sm:table-cell">{o.paymentMethod}</td>
                  <td className="whitespace-nowrap p-3 text-right">{formatEuro(o.totalCents)}</td>
                  <td className="p-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
