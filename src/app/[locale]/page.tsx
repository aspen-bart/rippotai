import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { langFromPrefix, localePath, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dictionaries";
import { getCategory, getFeaturedProducts, getFeaturedReviews, getProductsInCategory, getPage, pageHref } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { ReviewsCarousel } from "@/components/site/ReviewsCarousel";
import { IconArrow, IconDrop, IconFlower, IconHeart, IconLeaf, IconPen, IconSeed, IconTruck } from "@/components/site/icons";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const lang = langFromPrefix((await params).locale);
  if (!lang) notFound();
  const d = getDict(lang).home;
  const dict = getDict(lang);

  const [stationery, hospitality, featured, hospitalityProducts, reviews, altremani, sound] = await Promise.all([
    getCategory("cartoleria-ecologica-e-piantabile", lang),
    getCategory("soluzioni-sostenibili-per-hotel-e-hospitality", lang),
    getFeaturedProducts(lang, 8),
    getProductsInCategory("soluzioni-sostenibili-per-hotel-e-hospitality", lang, 4),
    getFeaturedReviews(8),
    getPage("carta-piantabile-fatta-in-carcere"),
    getPage("musicoterapia-strumenti-sonori-soundpotai"),
  ]);
  const tiles = stationery?.children ?? [];
  const contactHref = localePath(lang, "/pages/contatti");

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest-2 text-paper">
        <Image src="/images/home/img-1.jpg" alt="" fill priority sizes="100vw" className="-z-10 scale-105 object-cover object-[60%_center] opacity-90 motion-safe:animate-[heroZoom_18s_ease-out_forwards]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-2 via-forest-2/45 to-forest-2/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-2/70 to-transparent" />

        <div className="container-x pb-20 pt-40 md:pb-28">
          <div className="max-w-3xl">
            <p className="eyebrow !text-sprout">{d.heroEyebrow}</p>
            <h1 className="mt-5 whitespace-pre-line font-display text-[clamp(3rem,8vw,6.6rem)] font-light leading-[0.95] tracking-tight">
              {d.heroTitle.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {i === 1 ? (
                    <>
                      <em className="font-normal italic text-sprout">{line.split(" ")[0]}</em> {line.split(" ").slice(1).join(" ")}
                    </>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h1>
            <p className="mt-7 max-w-xl text-lg text-paper/85">{d.heroText}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={stationery?.href ?? localePath(lang)} className="btn-light">
                {d.heroCtaShop} <IconArrow />
              </Link>
              <Link href={hospitality?.href ?? contactHref} className="btn border border-paper/40 text-paper hover:bg-paper hover:text-forest">
                {d.heroCtaBusiness}
              </Link>
            </div>
          </div>
        </div>

        {/* Draaiende zegel */}
        <div className="pointer-events-none absolute bottom-24 right-6 hidden h-40 w-40 md:block lg:right-16 lg:h-48 lg:w-48">
          <svg viewBox="0 0 200 200" className="h-full w-full animate-spin-slow text-paper/90" aria-hidden>
            <defs>
              <path id="circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text fontSize="14" letterSpacing="3.2" fill="currentColor" style={{ textTransform: "uppercase" }}>
              <textPath href="#circle" textLength="486" lengthAdjust="spacing">{d.badge}</textPath>
            </text>
          </svg>
          <span className="absolute inset-0 m-auto grid h-16 w-16 place-items-center rounded-full bg-sprout text-forest-2">
            <IconSeed width={30} height={30} />
          </span>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-forest/10 bg-sprout/90 py-4 text-forest-2">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-2xl italic">
          {[...d.marquee, ...d.marquee, ...d.marquee, ...d.marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-10">
              {m} <IconLeaf width={20} height={20} className="not-italic" />
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIE-MOZAÏEK */}
      {tiles.length > 0 && (
        <section className="container-x py-24 md:py-32">
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">{d.categoriesEyebrow}</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight text-forest md:text-6xl">{d.categoriesTitle}</h2>
            </div>
            {stationery && (
              <Link href={stationery.href} className="btn-ghost text-forest">
                {stationery.title} <IconArrow />
              </Link>
            )}
          </Reveal>
          <div className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-4 md:auto-rows-[260px] md:grid-cols-4">
            {tiles.slice(0, 7).map((c, i) => {
              const layout = ["md:col-span-2 md:row-span-2", "", "", "md:row-span-2", "", "md:col-span-2", ""][i] ?? "";
              return (
                <Reveal key={c.id} delay={i * 70} className={`${layout} ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                  <Link href={c.href} className="group relative block h-full overflow-hidden rounded-[1.6rem] bg-paper-2">
                    {c.image && <Image src={c.image} alt={c.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition duration-[1.2s] ease-out group-hover:scale-110" />}
                    <span className="absolute inset-0 bg-gradient-to-t from-forest-2/80 via-forest-2/10 to-transparent transition group-hover:from-forest-2/90" />
                    <span className="absolute inset-x-5 bottom-5 text-paper">
                      <span className="block text-[0.68rem] uppercase tracking-[0.2em] text-sprout opacity-0 transition duration-500 group-hover:opacity-100">{c.tagline}</span>
                      <span className={`mt-1 flex items-center justify-between gap-3 font-display leading-tight ${i === 0 ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>
                        {c.title}
                        <span className="grid h-9 w-9 shrink-0 -translate-x-2 place-items-center rounded-full bg-paper text-forest opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                          <IconArrow />
                        </span>
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* DAL SEME AL FIORE */}
      <section className="paper-grain relative overflow-hidden bg-paper-2 py-24 md:py-32">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">{d.stepsEyebrow}</p>
            <h2 className="mt-3 font-display text-4xl text-forest md:text-5xl">{d.stepsTitle}</h2>
          </Reveal>
          <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
            <svg className="absolute left-[16%] right-[16%] top-12 hidden h-8 w-[68%] text-kraft-dark md:block" viewBox="0 0 600 30" preserveAspectRatio="none" aria-hidden>
              <path d="M0 15 C 100 -5, 200 35, 300 15 S 500 -5, 600 15" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
            </svg>
            {d.steps.map((s, i) => {
              const Icon = [IconPen, IconDrop, IconFlower][i];
              return (
                <Reveal key={s.title} delay={i * 150} className="relative text-center">
                  <span className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-paper text-leaf shadow-[0_10px_40px_-10px_rgba(29,58,44,.35)] ring-8 ring-paper-2">
                    <Icon width={38} height={38} />
                    <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-clay font-display text-sm text-white">{i + 1}</span>
                  </span>
                  <h3 className="mt-6 font-display text-3xl text-forest">{s.title}</h3>
                  <p className="mx-auto mt-3 max-w-xs text-ink/70">{s.text}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* HOSPITALITY */}
      <section className="relative overflow-hidden bg-forest text-paper">
        <div className="container-x grid gap-14 py-24 md:py-32 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="eyebrow !text-sprout">{d.hospitalityEyebrow}</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">{d.hospitalityTitle}</h2>
            <p className="mt-6 max-w-lg text-paper/80">{d.hospitalityText}</p>
            <ul className="mt-8 space-y-3">
              {d.hospitalityPoints.map((pt) => (
                <li key={pt} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sprout/20 text-sprout">
                    <IconLeaf width={15} height={15} />
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              {hospitality && (
                <Link href={hospitality.href} className="btn bg-sprout text-forest-2 hover:bg-paper">
                  {d.hospitalityCta} <IconArrow />
                </Link>
              )}
              <Link href={contactHref} className="btn border border-paper/30 hover:bg-paper hover:text-forest">
                {d.hospitalityQuote}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={150} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] md:ml-12">
              <Image src="/images/collections/sottopiatti-e-tovagliette-in-carta.jpg" alt="" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-8 -left-2 w-1/2 overflow-hidden rounded-[1.5rem] border-8 border-forest shadow-2xl md:-left-4">
              <div className="relative aspect-[4/3]">
                <Image src="/images/pages/incrementa-i-clienti-del-tuo-ristorante/s1-1.jpg" alt="" fill sizes="25vw" className="object-cover" />
              </div>
            </div>
            <div className="absolute -right-2 top-8 rounded-2xl bg-paper px-5 py-4 text-forest shadow-xl animate-float md:right-0">
              <p className="font-display text-3xl">100%</p>
              <p className="text-xs uppercase tracking-wider text-muted">{lang === "it" ? "personalizzabile" : "customisable"}</p>
            </div>
          </Reveal>
        </div>
        {hospitalityProducts.length > 0 && (
          <div className="container-x pb-24">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 [&_h3]:!text-paper [&_span.text-muted]:!text-paper/60">
              {hospitalityProducts.map((p) => (
                <ProductCard key={p.id} p={p} soldOut={dict.product.soldOut} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="container-x py-24 md:py-32">
          <Reveal className="text-center">
            <p className="eyebrow">{d.featuredEyebrow}</p>
            <h2 className="mt-3 font-display text-4xl text-forest md:text-5xl">{d.featuredTitle}</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <ProductCard p={p} soldOut={dict.product.soldOut} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* IMPACT */}
      <section className="container-x pb-24 md:pb-32">
        <div className="grid overflow-hidden rounded-[2rem] bg-paper-2 lg:grid-cols-2">
          <div className="relative min-h-[380px]">
            <Image src="/images/pages/carta-piantabile-fatta-in-carcere/s5-1.jpg" alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <Reveal className="p-8 md:p-14">
            <p className="eyebrow">{d.impactEyebrow}</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-forest md:text-5xl">{d.impactTitle}</h2>
            <p className="mt-5 text-ink/75">{d.impactText}</p>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
              {d.stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-4xl text-leaf-dark md:text-5xl">{s.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
            {altremani && (
              <Link href={pageHref(altremani, lang)} className="btn-primary mt-10">
                {d.impactCta} <IconArrow />
              </Link>
            )}
          </Reveal>
        </div>
      </section>

      {/* SOUNDPOTAI */}
      <section className="relative isolate overflow-hidden">
        <Image src="/images/home/img-2.jpg" alt="Soundpotai" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-2/90 via-forest-2/60 to-transparent" />
        <div className="container-x py-28 text-paper md:py-40">
          <Reveal className="max-w-lg">
            <p className="eyebrow !text-sprout">{d.soundEyebrow}</p>
            <h2 className="mt-3 font-display text-5xl leading-tight md:text-6xl">{d.soundTitle}</h2>
            <p className="mt-5 text-paper/85">{d.soundText}</p>
            {sound && (
              <Link href={pageHref(sound, lang)} className="btn-light mt-8">
                {d.soundCta} <IconArrow />
              </Link>
            )}
          </Reveal>
        </div>
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="overflow-hidden py-24 md:py-32">
          <div className="container-x">
            <Reveal className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">{d.reviewsEyebrow}</p>
                <h2 className="mt-3 font-display text-4xl text-forest md:text-5xl">{d.reviewsTitle}</h2>
              </div>
              <RatingSummary reviews={reviews} lang={lang} />
            </Reveal>
          </div>
          <ReviewsCarousel reviews={reviews.map((r) => ({ id: r.id, author: r.author, rating: r.rating, text: r.text, date: r.date.toISOString(), product: r.productName }))} lang={lang} />
        </section>
      )}

      {/* VALUES */}
      <section className="container-x">
        <ul className="grid grid-cols-2 gap-6 border-y border-line py-10 md:grid-cols-4">
          {d.values.map((v, i) => {
            const Icon = [IconTruck, IconDrop, IconHeart, IconLeaf][i];
            return (
              <li key={v} className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper-2 text-leaf-dark">
                  <Icon />
                </span>
                <span className="text-sm font-medium text-forest">{v}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function RatingSummary({ reviews, lang }: { reviews: { rating: number }[]; lang: Lang }) {
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <div className="flex items-center gap-4 rounded-full bg-paper-2 px-5 py-3">
      <span className="font-display text-3xl text-forest">{avg.toFixed(1)}</span>
      <span className="text-sm text-muted">
        <span className="block text-sun">{"★★★★★"}</span>
        {reviews.length} {lang === "it" ? "recensioni verificate" : "verified reviews"}
      </span>
    </div>
  );
}
