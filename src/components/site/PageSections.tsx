import Image from "next/image";
import Link from "next/link";
import type { PageSection } from "@/lib/catalog";
import { Reveal } from "./Reveal";
import { IconArrow } from "./icons";

// Rendert de gescrapete Shopify-secties (html + afbeeldingen + knoppen) in de nieuwe vormgeving.
// De lay-out wordt afgeleid uit de inhoud: tekst, tekst+beeld (afwisselend links/rechts) of galerij.

const textLength = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().length;

function Ctas({ ctas, dark }: { ctas: PageSection["ctas"]; dark?: boolean }) {
  if (!ctas?.length) return null;
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {ctas.map((c, i) => {
        const external = /^https?:/.test(c.href) || c.href.endsWith(".pdf");
        const cls = i === 0 ? (dark ? "btn-light" : "btn-primary") : "btn-ghost";
        return external ? (
          <a key={c.href + i} href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>
            {c.label} <IconArrow />
          </a>
        ) : (
          <Link key={c.href + i} href={c.href || "#"} className={cls}>
            {c.label} <IconArrow />
          </Link>
        );
      })}
    </div>
  );
}

export function PageSections({ sections, skipFirstImage }: { sections: PageSection[]; skipFirstImage?: boolean }) {
  let split = 0;
  return (
    <div className="space-y-20 py-16 md:space-y-28 md:py-24">
      {sections.map((s, idx) => {
        const images = idx === 0 && skipFirstImage ? s.images.slice(1) : s.images;
        const len = textLength(s.html);
        const key = idx;

        // Alleen een korte kop → grote statement-regel
        if (!images.length && len < 160 && /<h[23]/.test(s.html)) {
          return (
            <Reveal key={key} className="container-x text-center">
              <div className="prose-eco mx-auto max-w-3xl [&_h2]:text-4xl md:[&_h2]:text-6xl [&_h2]:font-light" dangerouslySetInnerHTML={{ __html: s.html }} />
              <div className="flex justify-center"><Ctas ctas={s.ctas} /></div>
            </Reveal>
          );
        }

        // Alleen tekst
        if (!images.length) {
          return (
            <Reveal key={key} className="container-x">
              <div className="mx-auto max-w-3xl">
                <div className="prose-eco" dangerouslySetInnerHTML={{ __html: s.html }} />
                <Ctas ctas={s.ctas} />
              </div>
            </Reveal>
          );
        }

        // Galerij (veel beelden)
        if (images.length > 4) {
          return (
            <section key={key} className="container-x">
              {len > 0 && (
                <Reveal className="mx-auto mb-10 max-w-3xl text-center">
                  <div className="prose-eco" dangerouslySetInnerHTML={{ __html: s.html }} />
                  <div className="flex justify-center"><Ctas ctas={s.ctas} /></div>
                </Reveal>
              )}
              <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
                {images.slice(0, 16).map((im, i) => (
                  <Reveal key={im.src} delay={(i % 4) * 60} className="break-inside-avoid overflow-hidden rounded-2xl bg-paper-2">
                    <Image src={im.src} alt={im.alt} width={600} height={600} sizes="(min-width:1024px) 25vw, 50vw" className="h-auto w-full transition duration-700 hover:scale-105" />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        }

        // Tekst + beeld(en), afwisselend links/rechts
        const flip = split++ % 2 === 1;
        if (len === 0) {
          return (
            <Reveal key={key} className="container-x">
              <div className={`grid gap-4 ${images.length > 1 ? "md:grid-cols-2" : ""}`}>
                {images.map((im) => (
                  <div key={im.src} className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-paper-2">
                    <Image src={im.src} alt={im.alt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </Reveal>
          );
        }
        return (
          <section key={key} className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className={`relative ${flip ? "lg:order-2" : ""}`}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-paper-2 md:aspect-[5/5]">
                <Image src={images[0].src} alt={images[0].alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
              </div>
              {images[1] && (
                <div className={`absolute -bottom-8 hidden w-2/5 overflow-hidden rounded-[1.5rem] border-8 border-paper shadow-xl md:block ${flip ? "-left-6" : "-right-6"}`}>
                  <div className="relative aspect-square">
                    <Image src={images[1].src} alt={images[1].alt} fill sizes="20vw" className="object-cover" />
                  </div>
                </div>
              )}
              <span className={`absolute -top-5 h-24 w-24 rounded-full bg-sprout/40 blur-2xl ${flip ? "-right-5" : "-left-5"}`} aria-hidden />
            </Reveal>
            <Reveal delay={120}>
              <div className="prose-eco" dangerouslySetInnerHTML={{ __html: s.html }} />
              <Ctas ctas={s.ctas} />
              {images.length > 2 && (
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {images.slice(2, 5).map((im) => (
                    <div key={im.src} className="relative aspect-square overflow-hidden rounded-xl bg-paper-2">
                      <Image src={im.src} alt={im.alt} fill sizes="12vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </Reveal>
          </section>
        );
      })}
    </div>
  );
}
