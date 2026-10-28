import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { langFromPrefix, t } from "@/lib/i18n";
import { getPage, type PageSection } from "@/lib/catalog";

// Shopify-policies (/policies/terms-of-service, ...) — opgeslagen als pagina "policy-<handle>".
type Props = { params: Promise<{ locale: string; handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params;
  const lang = langFromPrefix(locale);
  const page = lang ? await getPage(`policy-${handle}`) : null;
  return page && lang ? { title: t(page.title, lang) } : {};
}

export default async function PolicyPage({ params }: Props) {
  const { locale, handle } = await params;
  const lang = langFromPrefix(locale);
  if (!lang) notFound();
  const page = await getPage(`policy-${handle}`);
  if (!page) notFound();
  const sections = page.sections as Record<string, PageSection[]>;
  const list = sections[lang]?.length ? sections[lang] : sections.it;
  return (
    <>
      <section className="paper-grain bg-paper-2">
        <div className="container-x pb-12 pt-20">
          <p className="eyebrow">Rippotai</p>
          <h1 className="mt-3 font-display text-5xl font-light text-forest md:text-6xl">{t(page.title, lang)}</h1>
        </div>
      </section>
      <div className="container-x py-16">
        <article className="prose-eco mx-auto max-w-3xl">
          {list.map((s, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: s.html }} />
          ))}
        </article>
      </div>
    </>
  );
}
