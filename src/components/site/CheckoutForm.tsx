"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { placeOrder } from "@/lib/actions/site";
import type { Dict } from "@/lib/dictionaries";
import { COUNTRIES } from "@/lib/countries";
import { localePath } from "@/lib/i18n";
import { useStore } from "./StoreProvider";
import { IconArrow, IconSeed, IconShield } from "./icons";

export function CheckoutForm({
  dict,
  payments,
  shippingCents,
  freeFromCents,
}: {
  dict: Dict;
  payments: { key: string; name: string; svg: string }[];
  shippingCents: number;
  freeFromCents: number;
}) {
  const { lang, ready, items, subtotalCents, money, currency, country, clear } = useStore();
  const [state, action, pending] = useActionState(placeOrder, null);
  const [payment, setPayment] = useState(payments[0]?.key ?? "");
  const d = dict.checkout;
  const shipping = freeFromCents > 0 && subtotalCents >= freeFromCents ? 0 : shippingCents;

  useEffect(() => {
    if (state?.ok) clear();
  }, [state, clear]);

  if (state?.ok)
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-[2rem] bg-paper-2 p-10 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sprout/40 text-leaf-dark">
          <IconSeed width={36} height={36} />
        </span>
        <h2 className="mt-6 font-display text-4xl text-forest">{d.thanks}</h2>
        <p className="mt-3 text-ink/75">
          {d.thanksText} <strong className="text-forest">#{state.orderNumber}</strong>. {d.thanksMail}
        </p>
        <Link href={localePath(lang)} className="btn-primary mt-8">
          {d.backHome}
        </Link>
      </div>
    );

  if (!ready) return <div className="mt-10 h-96 animate-pulse rounded-[2rem] bg-paper-2" />;

  if (!items.length)
    return (
      <div className="mt-10 rounded-[2rem] bg-paper-2 p-10 text-center">
        <p className="font-display text-2xl text-forest">{dict.cart.empty}</p>
        <Link href={localePath(lang, "/collections/cartoleria-ecologica-e-piantabile")} className="btn-primary mt-6">
          {dict.cart.emptyCta}
        </Link>
      </div>
    );

  return (
    <form action={action} className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ variantId: i.variantId, qty: i.qty })))} />
      <input type="hidden" name="locale" value={lang} />
      <input type="hidden" name="currency" value={currency.code} />
      <input type="hidden" name="payment" value={payment} />

      <div className="space-y-10">
        <fieldset>
          <legend className="font-display text-2xl text-forest">{d.contact}</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label={d.email} name="email" type="email" required autoComplete="email" />
            <Input label={d.phone} name="phone" type="tel" autoComplete="tel" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl text-forest">{d.shippingAddress}</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label={d.firstName} name="firstName" required autoComplete="given-name" />
            <Input label={d.lastName} name="lastName" required autoComplete="family-name" />
            <Input label={d.address} name="address" required autoComplete="street-address" className="sm:col-span-2" />
            <Input label={d.zip} name="zip" required autoComplete="postal-code" />
            <Input label={d.city} name="city" required autoComplete="address-level2" />
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm text-forest">{d.country} *</span>
              <select name="country" defaultValue={country} className="field">
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c[lang]}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm text-forest">{d.notes}</span>
              <textarea name="note" rows={3} className="field" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl text-forest">{d.payment}</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {payments.map((p) => (
              <button
                type="button"
                key={p.key}
                onClick={() => setPayment(p.key)}
                className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left text-sm transition ${payment === p.key ? "border-forest ring-2 ring-forest/15" : "border-line hover:border-forest/40"}`}
                aria-pressed={payment === p.key}
              >
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${payment === p.key ? "border-forest" : "border-line"}`}>
                  {payment === p.key && <span className="h-2.5 w-2.5 rounded-full bg-forest" />}
                </span>
                <span className="overflow-hidden rounded [&>svg]:block [&>svg]:h-6 [&>svg]:w-[38px]" dangerouslySetInnerHTML={{ __html: p.svg }} />
                {p.name}
              </button>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sun/15 px-4 py-3 text-xs text-ink/75">
            <IconShield width={16} height={16} className="mt-0.5 shrink-0" /> {d.testMode}
          </p>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[2rem] bg-paper-2 p-6 md:p-8">
          <h2 className="font-display text-2xl text-forest">{d.summary}</h2>
          <ul className="mt-6 space-y-4">
            {items.map((it) => (
              <li key={it.variantId} className="flex items-center gap-4">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                  {it.image && <Image src={it.image} alt="" fill sizes="56px" className="object-cover" />}
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-forest text-[0.65rem] text-paper">{it.qty}</span>
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="line-clamp-2 text-forest">{it.title}</span>
                  {it.variantTitle && <span className="text-xs text-muted">{it.variantTitle}</span>}
                </span>
                <span className="text-sm">{money(it.priceCents * it.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt>{dict.cart.subtotal}</dt>
              <dd>{money(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{dict.cart.shipping}</dt>
              <dd>{shipping ? money(shipping) : dict.cart.free}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 font-display text-xl text-forest">
              <dt>{dict.cart.total}</dt>
              <dd>{money(subtotalCents + shipping)}</dd>
            </div>
            {currency.code !== "EUR" && (
              <p className="pt-2 text-xs text-muted">
                {dict.cart.note} (€ {((subtotalCents + shipping) / 100).toFixed(2)})
              </p>
            )}
          </dl>
          <label className="mt-6 flex items-start gap-2 text-xs text-muted">
            <input type="checkbox" name="consent" required className="mt-0.5 accent-leaf" /> {d.privacy}
          </label>
          {state?.error && <p className="mt-3 text-sm text-clay">{dict.contact.error}</p>}
          <button className="btn-primary mt-5 w-full" disabled={pending || !payment}>
            {d.placeOrder} <IconArrow />
          </button>
        </div>
      </aside>
    </form>
  );
}

function Input({ label, name, type = "text", required, autoComplete, className = "" }: { label: string; name: string; type?: string; required?: boolean; autoComplete?: string; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm text-forest">
        {label}
        {required && " *"}
      </span>
      <input name={name} type={type} required={required} autoComplete={autoComplete} className="field" />
    </label>
  );
}
