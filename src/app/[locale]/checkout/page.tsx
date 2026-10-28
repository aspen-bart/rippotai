import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { langFromPrefix } from "@/lib/i18n";
import { getDict } from "@/lib/dictionaries";
import { getPaymentMethods } from "@/lib/catalog";
import { getSetting } from "@/lib/settings";
import { CheckoutForm } from "@/components/site/CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const lang = langFromPrefix((await params).locale);
  if (!lang) notFound();
  const dict = getDict(lang);
  const [payments, store] = await Promise.all([getPaymentMethods(), getSetting("store")]);
  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="font-display text-5xl font-light text-forest">{dict.checkout.title}</h1>
      <CheckoutForm
        dict={dict}
        payments={payments.map((p) => ({ key: p.key, name: p.name, svg: p.svg }))}
        shippingCents={store.shippingCents}
        freeFromCents={store.freeShippingFromCents}
      />
    </section>
  );
}
