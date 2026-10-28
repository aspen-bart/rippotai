import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Fraunces, Jost } from "next/font/google";
import "../globals.css";
import { langFromPrefix, localePath, t } from "@/lib/i18n";
import { getDict } from "@/lib/dictionaries";
import { getSetting } from "@/lib/settings";
import { buildMenu } from "@/lib/menu";
import { getCategoryTree, getPaymentMethods } from "@/lib/catalog";
import { db } from "@/lib/db";
import { StoreProvider } from "@/components/site/StoreProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["SOFT", "opsz"] });

// Alles server-side renderen: content komt uit de database en wordt via /admin aangepast.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const lang = langFromPrefix((await params).locale) ?? "it";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100"),
    title: { default: lang === "it" ? "Rippotai | Idee regalo e arredi ecosostenibili" : "Rippotai | Sustainable gifts and furnishings", template: "%s | Rippotai" },
    description: getDict(lang).footer.tagline,
    icons: { icon: "/images/brand/logo-green.png" },
  };
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = langFromPrefix(locale);
  if (!lang) notFound();
  const dict = getDict(lang);
  const jar = await cookies();

  const [store, currency, whatsapp, menu, categories, payments, pages] = await Promise.all([
    getSetting("store"),
    getSetting("currency"),
    getSetting("whatsapp"),
    buildMenu(lang),
    getCategoryTree(lang),
    getPaymentMethods(),
    db.page.findMany({ where: { published: true }, select: { handle: true, handleEn: true, title: true } }),
  ]);

  const pageLink = (handle: string, label?: string) => {
    const p = pages.find((x) => x.handle === handle);
    if (!p) return null;
    const isPolicy = handle.startsWith("policy-");
    const h = isPolicy ? handle.replace("policy-", "") : lang === "en" && p.handleEn ? p.handleEn : p.handle;
    return { label: label ?? t(p.title, lang), href: localePath(lang, `/${isPolicy ? "policies" : "pages"}/${h}`) };
  };
  const nonNull = <T,>(x: T | null): x is T => !!x;
  const aboutLinks = [
    pageLink("chi-siamo", lang === "it" ? "Chi siamo" : "About us"),
    pageLink("sostenibilita", lang === "it" ? "Valori e Mission" : "Values and Mission"),
    pageLink("relazioni-dimpatto"),
    pageLink("il-codice-etico"),
    pageLink("carta-piantabile-fatta-in-carcere", "altreMANI"),
    pageLink("invia-la-tua-candidatura"),
  ].filter(nonNull);
  const careLinks = [
    pageLink("policy-terms-of-service", dict.footer.terms),
    pageLink("policy-shipping-policy", dict.footer.shipping),
    pageLink("policy-refund-policy", dict.footer.returns),
    pageLink("policy-privacy-policy", dict.footer.privacy),
    pageLink("faq-domande-frequenti", dict.footer.faq),
    pageLink("come-piantare-i-nostri-green-gadget"),
  ].filter(nonNull);

  const initialCurrency = currency.currencies.some((c) => c.code === jar.get("rp_currency")?.value) ? jar.get("rp_currency")!.value : "EUR";

  return (
    <html lang={lang} className={`${jost.variable} ${fraunces.variable}`}>
      <body className="min-h-screen">
        <StoreProvider lang={lang} currencies={currency.currencies} initialCurrency={initialCurrency} initialCountry={jar.get("rp_country")?.value ?? "it"}>
          <Header menu={menu} dict={dict} announcement={t(store.announcement, lang)} />
          <main>{children}</main>
          <Footer
            lang={lang}
            dict={dict}
            store={store}
            categories={categories}
            aboutLinks={aboutLinks}
            careLinks={careLinks}
            payments={payments.map((p) => ({ key: p.key, name: p.name, svg: p.svg }))}
          />
          <CartDrawer dict={dict} />
          <WhatsAppButton settings={whatsapp} lang={lang} />
        </StoreProvider>
      </body>
    </html>
  );
}
