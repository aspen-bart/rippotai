import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatEuro } from "@/lib/admin/money";
import { Thumb } from "@/components/admin/ImageInput";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ORDER_STATUSES, OrderStatusBadge, PageHeader, Panel, fieldSm, fmtDateTime } from "@/components/admin/ui";
import { setOrderStatus } from "@/app/admin/actions/orders";

export const metadata = { title: "Bestelling" };

type Item = { productId?: string; handle?: string; title?: string; variantTitle?: string; qty?: number; priceCents?: number; image?: string };

const ADDRESS_LABELS: Record<string, string> = {
  company: "Bedrijf",
  address: "Adres",
  address1: "Adres",
  address2: "Adres 2",
  street: "Straat",
  zip: "Postcode",
  postalCode: "Postcode",
  city: "Plaats",
  province: "Provincie",
  country: "Land",
  vat: "Btw-nummer",
  fiscalCode: "Codice fiscale",
  sdi: "SDI / PEC",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id } });
  if (!order) notFound();
  const items = (Array.isArray(order.items) ? order.items : []) as Item[];
  const address = order.address && typeof order.address === "object" && !Array.isArray(order.address) ? (order.address as Record<string, unknown>) : {};

  return (
    <>
      <PageHeader
        title={`Bestelling #${order.number}`}
        description={
          <>
            <Link href="/admin/bestellingen" className="hover:text-forest">
              ← Alle bestellingen
            </Link>{" "}
            · {fmtDateTime(order.createdAt)}
          </>
        }
        action={<OrderStatusBadge status={order.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel title="Artikelen">
          <ul className="divide-y divide-line">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 py-3 text-sm">
                <Thumb src={it.image} className="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  {it.productId ? (
                    <Link href={`/admin/shop/producten/${it.productId}`} className="font-medium text-forest hover:text-leaf-dark">
                      {it.title ?? it.handle ?? "Product"}
                    </Link>
                  ) : (
                    <span className="font-medium">{it.title ?? it.handle ?? "Product"}</span>
                  )}
                  {it.variantTitle && it.variantTitle !== "Default Title" && <span className="block text-xs text-muted">{it.variantTitle}</span>}
                </div>
                <span className="whitespace-nowrap text-muted">
                  {it.qty ?? 1} × {formatEuro(it.priceCents ?? 0)}
                </span>
                <span className="w-24 whitespace-nowrap text-right font-medium">{formatEuro((it.priceCents ?? 0) * (it.qty ?? 1))}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-1 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotaal</dt>
              <dd>{formatEuro(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Verzending</dt>
              <dd>{order.shippingCents ? formatEuro(order.shippingCents) : "Gratis"}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold text-forest">
              <dt>Totaal</dt>
              <dd>{formatEuro(order.totalCents)}</dd>
            </div>
            <p className="text-xs text-muted">
              Valuta bij bestelling: {order.currency} · Betaalmethode: {order.paymentMethod} · Taal: {order.locale}
            </p>
          </dl>
          {order.note && (
            <div className="mt-4 rounded-xl bg-paper p-3 text-sm">
              <p className="mb-1 text-xs font-medium text-muted">Opmerking klant</p>
              <p className="whitespace-pre-wrap">{order.note}</p>
            </div>
          )}
        </Panel>

        <div className="grid content-start gap-6">
          <Panel title="Status">
            <form action={setOrderStatus} className="flex gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className={fieldSm}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <SubmitButton className="btn-primary px-4 py-2" pendingText="…">
                Wijzig
              </SubmitButton>
            </form>
          </Panel>
          <Panel title="Klant">
            <p className="font-medium">{order.name}</p>
            <a href={`mailto:${order.email}`} className="block text-sm text-leaf-dark hover:underline">
              {order.email}
            </a>
            {order.phone && (
              <a href={`tel:${order.phone}`} className="block text-sm text-leaf-dark hover:underline">
                {order.phone}
              </a>
            )}
            {Object.keys(address).length > 0 && (
              <dl className="mt-4 grid gap-1 text-sm">
                {Object.entries(address)
                  .filter(([, v]) => v !== null && v !== "" && typeof v !== "object")
                  .map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[100px_1fr] gap-2">
                      <dt className="text-xs text-muted">{ADDRESS_LABELS[k] ?? k}</dt>
                      <dd>{String(v)}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
