import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { langFromPrefix } from "@/lib/i18n";
import { getDict } from "@/lib/dictionaries";
import { searchProducts, getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { IconSearch } from "@/components/site/icons";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  const lang = langFromPrefix((await params).locale);
  if (!lang) notFound();
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const dict = getDict(lang);
  const results = q ? await searchProducts(q, lang) : await getFeaturedProducts(lang, 8);
  return (
    <section className="container-x py-16 md:py-24">
      <h1 className="font-display text-5xl font-light text-forest">{dict.search.title}</h1>
      <form className="mt-8 flex max-w-2xl items-center gap-3 rounded-full bg-white p-2 pl-6 ring-1 ring-line focus-within:ring-2 focus-within:ring-leaf">
        <IconSearch className="text-muted" />
        <input name="q" defaultValue={q} placeholder={dict.search.placeholder} autoFocus className="flex-1 bg-transparent py-2 outline-none" />
        <button className="btn-primary">{dict.search.title}</button>
      </form>
      {q && (
        <p className="mt-6 text-muted">
          {results.length} {dict.search.results} &ldquo;{q}&rdquo;
        </p>
      )}
      {q && !results.length ? (
        <p className="mt-10 text-lg text-forest">{dict.search.none}</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} p={p} soldOut={dict.product.soldOut} />
          ))}
        </div>
      )}
    </section>
  );
}
