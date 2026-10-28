import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { langFromPrefix, localePath } from "@/lib/i18n";
import { getDict } from "@/lib/dictionaries";
import { getCategory, getCategoryProducts, getCategoryTree } from "@/lib/catalog";
import { CollectionGrid } from "@/components/site/CollectionGrid";
import { ExpandableHtml } from "@/components/site/ExpandableHtml";
import { Reveal } from "@/components/site/Reveal";
import { IconArrow, IconLeaf } from "@/components/site/icons";

type Props = { params: Promise<{ locale: string; handle: string }> };

const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params;
  const lang = langFromPrefix(locale);
  const cat = lang ? await getCategory(handle, lang) : null;
  if (!cat) return {};
  return { title: cat.title, description: plain(cat.description).slice(0, 160), openGraph: { images: cat.image ? [cat.image] : [] } };
}

export default async function CollectionPage({ params }: Props) {
  const { locale, handle } = await params;
  const lang = langFromPrefix(locale);
  if (!lang) notFound();
  const cat = await getCategory(handle, lang);
  if (!cat) notFound();
  const dict = getDict(lang);
  const d = dict.collection;

  const ids = [cat.id, ...cat.children.map((c) => c.id)];
  const [products, tree] = await Promise.all([getCategoryProducts(ids, lang), getCategoryTree(lang)]);
  // Chips: eigen subcategorieën, of de "zusjes" als dit zelf een subcategorie is
  const chips = cat.children.length ? cat.children : cat.parent?.children ?? [];
  const others = tree.filter((c) => c.id !== cat.id && c.id !== cat.parent?.id && c.image).slice(0, 6);
  const contactHref = localePath(lang, "/pages/contatti");

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-forest-2 text-paper">
        {cat.image && <Image src={cat.image} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-70" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-2 via-forest-2/50 to-forest-2/20" />
        <div className="container-x flex min-h-[52vh] flex-col justify-end pb-14 pt-24 md:min-h-[60vh]">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-paper/70" aria-label="Breadcrumb">
            <Link href={localePath(lang)} className="hover:text-paper">Home</Link>
            <span>/</span>
            {cat.parent && (
              <>
                <Link href={cat.parent.href} className="hover:text-paper">{cat.parent.title}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-sprout">{cat.title}</span>
          </nav>
          {cat.tagline && <p className="font-display text-xl italic text-sprout md:text-2xl">{cat.tagline}</p>}
          <h1 className="mt-2 max-w-4xl font-display text-5xl font-light leading-[1] tracking-tight md:text-7xl">{cat.title}</h1>
          <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-paper/10 px-4 py-2 text-sm backdrop-blur">
            <IconLeaf width={16} height={16} className="text-sprout" />
            {products.length} {products.length === 1 ? d.product : d.products}
          </p>
        </div>
      </section>

      {/* SUBCATEGORIEËN */}
      {chips.length > 0 && (
        <div className="border-b border-line bg-paper">
          <div className="container-x">
            <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 py-5 [scrollbar-width:none]">
              {cat.parent && (
                <li>
                  <Link href={cat.parent.href} className="flex h-full items-center whitespace-nowrap rounded-full border border-line px-5 py-2.5 text-sm text-forest hover:border-forest">
                    {d.all}
                  </Link>
                </li>
              )}
              {chips.map((c) => (
                <li key={c.id}>
                  <Link
                    href={c.href}
                    className={`group flex items-center gap-3 whitespace-nowrap rounded-full border py-1.5 pl-1.5 pr-5 text-sm transition ${c.id === cat.id ? "border-forest bg-forest text-paper" : "border-line text-forest hover:border-forest"}`}
                  >
                    <span className="relative h-9 w-9 overflow-hidden rounded-full bg-paper-2">
                      {c.image && <Image src={c.image} alt="" fill sizes="36px" className="object-cover transition group-hover:scale-110" />}
                    </span>
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* VERHAAL */}
      {cat.description && (
        <section className="container-x grid gap-10 py-16 md:py-20 lg:grid-cols-[1fr_2fr]">
          <Reveal>
            <p className="eyebrow">Rippotai</p>
            <p className="mt-3 font-display text-3xl leading-tight text-forest md:text-4xl">{cat.tagline || cat.title}</p>
          </Reveal>
          <Reveal delay={100}>
            <ExpandableHtml html={cat.description} more={d.readMore} less={d.readLess} />
          </Reveal>
        </section>
      )}

      {/* PRODUCTEN */}
      <section className="container-x pb-10">
        {products.length ? (
          <CollectionGrid
            products={products}
            filters={cat.children.map((c) => ({ handle: c.handle, title: c.title }))}
            dict={d}
            soldOut={dict.product.soldOut}
            story={{ title: d.storyTitle, text: d.storyText, image: "/images/home/img-1.jpg" }}
            business={{ title: d.businessTitle, text: d.businessText, cta: d.businessCta, href: contactHref }}
          />
        ) : (
          <p className="rounded-3xl bg-paper-2 p-10 text-center text-muted">{d.empty}</p>
        )}
      </section>

      {/* B2B BAND */}
      <section className="container-x py-16">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-forest text-paper md:grid-cols-[1.3fr_1fr]">
          <div className="p-10 md:p-14">
            <p className="eyebrow !text-sprout">Shop Aziende</p>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{d.businessTitle}</h2>
            <p className="mt-4 max-w-md text-paper/80">{d.businessText}</p>
            <Link href={contactHref} className="btn mt-8 bg-sprout text-forest-2 hover:bg-paper">
              {d.businessCta} <IconArrow />
            </Link>
          </div>
          <div className="relative min-h-[260px]">
            <Image src="/images/pages/incrementa-i-clienti-del-tuo-ristorante/s1-1.jpg" alt="" fill sizes="40vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest to-transparent" />
          </div>
        </div>
      </section>

      {/* ANDERE COLLECTIES */}
      {others.length > 0 && (
        <section className="container-x pb-8 pt-8">
          <h2 className="font-display text-3xl text-forest">{d.explore}</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {others.map((c) => (
              <Link key={c.id} href={c.href} className="group">
                <div className="relative aspect-square overflow-hidden rounded-full bg-paper-2 ring-1 ring-line">
                  <Image src={c.image!} alt="" fill sizes="200px" className="object-cover transition duration-700 group-hover:scale-110" />
                </div>
                <p className="mt-3 text-center text-sm text-forest group-hover:text-leaf-dark">{c.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
