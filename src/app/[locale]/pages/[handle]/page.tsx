import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { langFromPrefix, localePath, t, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dictionaries";
import { getPage, pageHref, type PageSection } from "@/lib/catalog";
import { getSetting } from "@/lib/settings";
import { PageSections } from "@/components/site/PageSections";
import { ContactForm } from "@/components/site/ContactForm";
import { IconMail, IconPhone, IconPin, IconWhatsApp } from "@/components/site/icons";

type Props = { params: Promise<{ locale: string; handle: string }> };

// Pagina's onder "Chi siamo" krijgen onderaan een navigatie naar elkaar.
const ABOUT = ["chi-siamo", "sostenibilita", "relazioni-dimpatto", "il-codice-etico"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params;
  const lang = langFromPrefix(locale);
  const page = lang ? await getPage(decodeURIComponent(handle)) : null;
  if (!page || !lang) return {};
  return {
    title: t(page.title, lang),
    description: t(page.description, lang) || undefined,
    alternates: { languages: { it: pageHref(page, "it"), en: pageHref(page, "en") } },
  };
}

export default async function ContentPage({ params }: Props) {
  const { locale, handle } = await params;
  const lang = langFromPrefix(locale);
  if (!lang) notFound();
  const slug = decodeURIComponent(handle);
  const page = await getPage(slug);
  if (!page || page.handle.startsWith("policy-")) notFound();
  if (pageHref(page, lang) !== localePath(lang, `/pages/${slug}`)) redirect(pageHref(page, lang));

  const all = page.sections as Record<string, PageSection[]>;
  const sections = all[lang]?.length ? all[lang] : all.it ?? [];
  const title = t(page.title, lang);

  if (page.handle === "contatti") return <ContactPage lang={lang} />;

  const heroImage = sections[0]?.images[0]?.src;
  const aboutPages = ABOUT.includes(page.handle) ? await Promise.all(ABOUT.map((h) => getPage(h))) : [];

  return (
    <>
      {heroImage ? (
        <section className="relative isolate overflow-hidden bg-forest-2 text-paper">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-60" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-2 via-forest-2/40 to-transparent" />
          <div className="container-x flex min-h-[55vh] flex-col justify-end pb-14 pt-28">
            <p className="eyebrow !text-sprout">Rippotai</p>
            <h1 className="mt-3 max-w-4xl font-display text-5xl font-light leading-[1.02] md:text-7xl">{title}</h1>
            {t(page.description, lang) && <p className="mt-5 max-w-2xl text-paper/80">{t(page.description, lang)}</p>}
          </div>
        </section>
      ) : (
        <section className="paper-grain bg-paper-2">
          <div className="container-x pb-14 pt-20 md:pt-28">
            <p className="eyebrow">Rippotai</p>
            <h1 className="mt-3 max-w-4xl font-display text-5xl font-light leading-[1.02] text-forest md:text-7xl">{title}</h1>
            {t(page.description, lang) && <p className="mt-5 max-w-2xl text-ink/70">{t(page.description, lang)}</p>}
          </div>
        </section>
      )}

      <PageSections sections={sections} skipFirstImage={!!heroImage} />

      {aboutPages.length > 0 && (
        <nav className="container-x">
          <ul className="grid gap-4 md:grid-cols-4">
            {aboutPages.filter((p): p is NonNullable<typeof p> => !!p).map((p, i) => {
              const active = p.handle === page.handle;
              return (
                <li key={p.id}>
                  <Link href={pageHref(p, lang)} className={`group flex h-full flex-col justify-between rounded-3xl p-6 transition ${active ? "bg-forest text-paper" : "bg-paper-2 text-forest hover:bg-kraft/50"}`}>
                    <span className="font-display text-4xl opacity-40">0{i + 1}</span>
                    <span className="mt-6 font-display text-xl">{t(p.title, lang)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}

async function ContactPage({ lang }: { lang: Lang }) {
  const dict = getDict(lang);
  const d = dict.contact;
  const [store, whatsapp] = await Promise.all([getSetting("store"), getSetting("whatsapp")]);
  const c = store.company;
  const mapQuery = encodeURIComponent(c.headquarters);
  return (
    <>
      <section className="paper-grain bg-paper-2">
        <div className="container-x grid gap-12 pb-20 pt-20 md:pt-28 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">{d.eyebrow}</p>
            <h1 className="mt-3 font-display text-5xl font-light leading-[1.02] text-forest md:text-7xl">{d.title}</h1>
            <p className="mt-6 max-w-md text-ink/70">{d.text}</p>
            <ul className="mt-10 space-y-5">
              <li className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-paper text-leaf-dark"><IconPhone /></span>
                <a href={`tel:+39${c.phone.replace(/\s/g, "")}`} className="text-lg text-forest hover:text-leaf-dark">{c.phone}</a>
              </li>
              <li className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-paper text-leaf-dark"><IconMail /></span>
                <a href={`mailto:${c.email}`} className="text-lg text-forest hover:text-leaf-dark">{c.email}</a>
              </li>
              {whatsapp.enabled && (
                <li className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#25d366] text-white"><IconWhatsApp width={22} height={22} /></span>
                  <a href={`https://wa.me/${whatsapp.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-lg text-forest hover:text-leaf-dark">WhatsApp</a>
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-[2rem] bg-paper p-6 shadow-[0_30px_80px_-40px_rgba(29,58,44,.45)] md:p-10">
            <ContactForm dict={d} privacy={dict.checkout.privacy} />
          </div>
        </div>
      </section>
      <section className="container-x grid gap-6 py-20 md:grid-cols-2">
        <div className="rounded-[2rem] bg-forest p-8 text-paper md:p-10">
          <p className="eyebrow !text-sprout">{d.visit}</p>
          <div className="mt-6 space-y-6">
            <div className="flex gap-4">
              <IconPin className="mt-1 shrink-0 text-sprout" />
              <div>
                <p className="font-display text-2xl">{d.hq}</p>
                <p className="mt-1 text-paper/80">{c.headquarters}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <IconPin className="mt-1 shrink-0 text-sprout" />
              <div>
                <p className="font-display text-2xl">{d.registered}</p>
                <p className="mt-1 text-paper/80">{c.registeredOffice}</p>
              </div>
            </div>
            <p className="border-t border-paper/15 pt-6 text-sm text-paper/60">
              {c.name} {c.legal} · P.IVA {c.vat} · PEC {c.pec}
            </p>
          </div>
        </div>
        <div className="min-h-[340px] overflow-hidden rounded-[2rem] bg-paper-2">
          <iframe
            title="Map"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            className="h-full min-h-[340px] w-full grayscale-[40%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
