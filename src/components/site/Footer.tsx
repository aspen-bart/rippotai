import Link from "next/link";
import Image from "next/image";
import type { Dict } from "@/lib/dictionaries";
import type { StoreSettings } from "@/lib/settings-defaults";
import type { CategoryView } from "@/lib/catalog";
import { localePath, type Lang } from "@/lib/i18n";
import { NewsletterForm } from "./NewsletterForm";
import { IconFacebook, IconInstagram, IconMail, IconPhone, IconPin, IconTiktok, IconYoutube, IconSeed } from "./icons";

type Link_ = { label: string; href: string };

export function Footer({
  lang,
  dict,
  store,
  categories,
  aboutLinks,
  careLinks,
  payments,
}: {
  lang: Lang;
  dict: Dict;
  store: StoreSettings;
  categories: CategoryView[];
  aboutLinks: Link_[];
  careLinks: Link_[];
  payments: { key: string; name: string; svg: string }[];
}) {
  const c = store.company;
  const shopLinks = categories.flatMap((cat) => (cat.children.length ? [cat, ...cat.children.slice(0, 4)] : [cat])).slice(0, 8);
  const socials = [
    { href: store.social.instagram, label: "Instagram", Icon: IconInstagram },
    { href: store.social.facebook, label: "Facebook", Icon: IconFacebook },
    { href: store.social.youtube, label: "YouTube", Icon: IconYoutube },
    { href: store.social.tiktok, label: "TikTok", Icon: IconTiktok },
  ].filter((s) => s.href);

  return (
    <footer className="relative mt-24">
      {/* Nieuwsbrief op kraftpapier, half over de donkere footer */}
      <div className="container-x relative z-10">
        <div className="paper-grain relative grid overflow-hidden rounded-[2rem] bg-kraft px-6 py-10 md:grid-cols-[1.1fr_1fr] md:gap-10 md:px-14 md:py-14">
          <svg className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 text-forest/10" viewBox="0 0 200 200" aria-hidden>
            <path fill="currentColor" d="M100 10c40 30 60 70 50 110-8 32-30 55-50 70-20-15-42-38-50-70C40 80 60 40 100 10Z" />
            <path d="M100 30v160" stroke="currentColor" strokeWidth="3" />
          </svg>
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-paper/60 px-3 py-1 text-xs font-medium text-forest">
              <IconSeed width={16} height={16} /> -10%
            </span>
            <h2 className="mt-4 font-display text-3xl leading-tight text-forest md:text-4xl">{dict.footer.newsletterTitle}</h2>
            <p className="mt-3 max-w-md text-forest/80">{dict.footer.newsletterText}</p>
          </div>
          <div className="relative mt-6 md:mt-2">
            <NewsletterForm dict={dict} />
          </div>
        </div>
      </div>

      <div className="relative -mt-20 bg-forest-2 pt-36 text-paper/80">
        <svg className="absolute inset-x-0 top-0 h-6 w-full text-paper" viewBox="0 0 1440 24" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0 0h1440v6c-120 10-240 14-360 10S840 4 720 6 480 18 360 18 120 10 0 6V0Z" />
        </svg>
        <div className="container-x grid gap-12 pb-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr]">
          <div>
            <Image src="/images/brand/logo-white.png" alt="Rippotai" width={88} height={88} className="h-20 w-auto" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">{dict.footer.tagline}</p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-paper/15 transition hover:border-sprout hover:bg-sprout hover:text-forest-2">
                  <Icon width={18} height={18} />
                </a>
              ))}
            </div>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-sprout/30 px-3 py-1 text-xs text-sprout">
              <span className="h-1.5 w-1.5 rounded-full bg-sprout" /> {c.legal}
            </p>
          </div>

          <FooterCol title={dict.footer.shop} links={shopLinks.map((x) => ({ label: x.title, href: x.href }))} />
          <FooterCol title={dict.footer.company} links={aboutLinks} />
          <FooterCol title={dict.footer.care} links={careLinks} />

          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-paper">{dict.footer.contacts}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <IconPhone width={18} height={18} className="mt-0.5 shrink-0 text-sprout" />
                <a href={`tel:+39${c.phone.replace(/\s/g, "")}`} className="hover:text-paper">{c.phone}</a>
              </li>
              <li className="flex gap-3">
                <IconMail width={18} height={18} className="mt-0.5 shrink-0 text-sprout" />
                <span>
                  <a href={`mailto:${c.email}`} className="hover:text-paper">{c.email}</a>
                  <br />
                  <span className="text-paper/50">PEC</span> {c.pec}
                </span>
              </li>
              <li className="flex gap-3">
                <IconPin width={18} height={18} className="mt-0.5 shrink-0 text-sprout" />
                <span>
                  <span className="block text-paper">{dict.contact.hq}</span>
                  {c.headquarters}
                  <span className="mt-2 block text-paper">{dict.contact.registered}</span>
                  {c.registeredOffice}
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-2xl bg-white/5 p-4 text-sm">
              <p className="font-medium text-paper">{dict.footer.retailer}</p>
              <p className="mt-1 text-paper/70">{dict.footer.retailerText}</p>
              <Link href={localePath(lang, "/pages/contatti")} className="mt-2 inline-block text-sprout underline underline-offset-4">
                {dict.nav.contacts} →
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-paper/10">
          <div className="container-x flex flex-col items-center gap-5 py-7 lg:flex-row lg:justify-between">
            <p className="text-xs text-paper/50">
              © {new Date().getFullYear()} {c.name} {c.legal} · P.IVA {c.vat} · {dict.footer.rights}
            </p>
            {payments.length > 0 && (
              <ul className="flex flex-wrap items-center justify-center gap-1.5" aria-label={dict.footer.payments}>
                {payments.map((p) => (
                  <li key={p.key} title={p.name} className="overflow-hidden rounded-[4px] bg-white [&>svg]:block [&>svg]:h-6 [&>svg]:w-[38px]" dangerouslySetInnerHTML={{ __html: p.svg }} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Link_[] }) {
  return (
    <div>
      <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-paper">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="group inline-flex items-center gap-2 transition hover:text-paper">
              <span className="h-px w-0 bg-sprout transition-all duration-300 group-hover:w-3" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
