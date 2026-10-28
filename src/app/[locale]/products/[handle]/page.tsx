import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { langFromPrefix, localePath, t } from "@/lib/i18n";
import { getDict } from "@/lib/dictionaries";
import { getProduct, getRelatedProducts, productHandle, productHref, type Img } from "@/lib/catalog";
import { ProductGallery } from "@/components/site/ProductGallery";
import { AddToCart } from "@/components/site/AddToCart";
import { ProductCard } from "@/components/site/ProductCard";
import { Price } from "@/components/site/StoreProvider";
import { IconHeart, IconSeed, IconShield, IconStar, IconTruck } from "@/components/site/icons";

type Props = { params: Promise<{ locale: string; handle: string }> };
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params;
  const lang = langFromPrefix(locale);
  const p = lang ? await getProduct(handle) : null;
  if (!p || !lang) return {};
  const images = p.images as Img[];
  return {
    title: t(p.title, lang),
    description: plain(t(p.body, lang)).slice(0, 160),
    openGraph: { images: images[0] ? [images[0].src] : [] },
    alternates: { languages: { it: productHref(p, "it"), en: productHref(p, "en") } },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, handle } = await params;
  const lang = langFromPrefix(locale);
  if (!lang) notFound();
  const p = await getProduct(decodeURIComponent(handle));
  if (!p) notFound();
  // Shopify gebruikt per taal een eigen handle: altijd naar de canonieke URL van deze taal.
  if (productHandle(p, lang) !== decodeURIComponent(handle)) redirect(productHref(p, lang));

  const dict = getDict(lang);
  const d = dict.product;
  const title = t(p.title, lang);
  const images = ((p.images as Img[]) ?? []).map((im) => ({ ...im, alt: im.alt || title }));
  const options = ((p.options as { name: Record<string, string>; values: string[] }[]) ?? []).filter((o) => !(o.values.length === 1 && o.values[0] === "Default Title"));
  const mainCat = p.categories.find((c) => c.parentId) ?? p.categories[0];
  const related = await getRelatedProducts(p.id, p.categories.map((c) => c.id), lang, 4);
  const isPlantable = /piantabil|semi|seed|plant/i.test(t(p.title, "it") + JSON.stringify(p.tags));
  const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: images.map((i) => i.src),
    sku: p.variants[0]?.sku ?? undefined,
    brand: { "@type": "Brand", name: "Rippotai" },
    offers: { "@type": "AggregateOffer", priceCurrency: "EUR", lowPrice: (p.priceCents / 100).toFixed(2), offerCount: p.variants.length, availability: p.variants.some((v) => v.available) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-x pt-8">
        <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted" aria-label="Breadcrumb">
          <Link href={localePath(lang)} className="hover:text-forest">Home</Link>
          {mainCat && (
            <>
              <span>/</span>
              <Link href={localePath(lang, `/collections/${mainCat.handle}`)} className="hover:text-forest">{t(mainCat.title, lang)}</Link>
            </>
          )}
        </nav>
      </div>

      <section className="container-x grid gap-10 py-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery images={images} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          {mainCat && <p className="eyebrow">{t(mainCat.title, lang)}</p>}
          <h1 className="mt-3 font-display text-4xl leading-[1.08] text-forest md:text-5xl">{title}</h1>
          {avg && (
            <a href="#reviews" className="mt-3 flex items-center gap-2 text-sm text-muted">
              <span className="flex text-clay">{Array.from({ length: 5 }, (_, i) => <IconStar key={i} filled={i < Math.round(avg)} />)}</span>
              {p.reviews.length} {d.reviews.toLowerCase()}
            </a>
          )}
          <Price cents={p.priceCents} compareCents={p.compareCents} className="mt-5 block font-display text-3xl text-forest" />
          <p className="mt-1 text-xs text-muted">{d.payIn}</p>

          <AddToCart
            product={{ id: p.id, title, href: productHref(p, lang), image: images[0]?.src ?? null }}
            options={options.map((o) => ({ name: o.name[lang] || o.name.it, values: o.values }))}
            variants={p.variants.map((v) => ({ id: v.id, title: v.title, priceCents: v.priceCents, compareCents: v.compareCents, available: v.available, options: (v.options as string[]) ?? [] }))}
            dict={d}
          />

          <ul className="mt-8 grid grid-cols-3 gap-3 border-y border-line py-5 text-center text-xs text-forest">
            {d.perks.map((perk, i) => {
              const Icon = [IconTruck, IconHeart, IconShield][i];
              return (
                <li key={perk} className="flex flex-col items-center gap-2">
                  <Icon className="text-leaf-dark" />
                  {perk}
                </li>
              );
            })}
          </ul>

          <div className="mt-2 divide-y divide-line">
            <Accordion title={d.description} open>
              <div className="prose-eco !text-[0.95rem]" dangerouslySetInnerHTML={{ __html: t(p.body, lang) }} />
            </Accordion>
            {isPlantable && (
              <Accordion title={d.howToPlant}>
                <div className="flex gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sprout/30 text-leaf-dark">
                    <IconSeed />
                  </span>
                  <p className="text-sm text-ink/75">{d.howToPlantText}</p>
                </div>
              </Accordion>
            )}
            <Accordion title={d.shipping}>
              <p className="text-sm text-ink/75">{d.shippingText}</p>
            </Accordion>
          </div>
        </div>
      </section>

      {p.reviews.length > 0 && (
        <section id="reviews" className="container-x py-16">
          <h2 className="font-display text-3xl text-forest">{d.reviews}</h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {p.reviews.map((r) => (
              <li key={r.id} className="rounded-3xl bg-white p-6">
                <div className="flex text-clay">{Array.from({ length: 5 }, (_, i) => <IconStar key={i} filled={i < r.rating} />)}</div>
                <p className="mt-3 font-display text-lg text-forest">{r.text}</p>
                <p className="mt-3 text-sm text-muted">{r.author}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="container-x py-16">
          <h2 className="font-display text-3xl text-forest md:text-4xl">{d.related}</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} soldOut={d.soldOut} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Accordion({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group py-4" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-forest">
        {title}
        <span className="grid h-7 w-7 place-items-center rounded-full border border-line transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
