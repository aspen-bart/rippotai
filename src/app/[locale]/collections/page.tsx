import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { langFromPrefix } from "@/lib/i18n";
import { getDict } from "@/lib/dictionaries";
import { getCategoryTree } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

// Overzicht van alle collecties, gegroepeerd per Shop Privati / Shop Aziende.
export default async function CollectionsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const lang = langFromPrefix((await params).locale);
  if (!lang) notFound();
  const dict = getDict(lang);
  const tree = await getCategoryTree(lang);
  const groups = [
    { title: dict.nav.privateShop, items: tree.filter((c) => c.group === "private").flatMap((c) => [c, ...c.children]) },
    { title: dict.nav.companyShop, items: tree.filter((c) => c.group === "company").flatMap((c) => [c, ...c.children]) },
  ];
  return (
    <div className="container-x py-16 md:py-24">
      <h1 className="font-display text-5xl font-light text-forest md:text-7xl">{dict.collection.explore}</h1>
      {groups.map((g) => (
        <section key={g.title} className="mt-16">
          <p className="eyebrow">{g.title}</p>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {g.items.map((c) => (
              <Link key={c.id} href={c.href} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-paper-2">
                  {c.image && <Image src={c.image} alt="" fill sizes="25vw" className="object-cover transition duration-700 group-hover:scale-105" />}
                </div>
                <p className="mt-3 font-display text-xl text-forest">{c.title}</p>
                <p className="text-sm text-muted">
                  {c.productCount} {dict.collection.products}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
