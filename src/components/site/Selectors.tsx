"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/lib/dictionaries";
import { COUNTRIES, flagUrl } from "@/lib/countries";
import { LANGS, LANG_LABEL, LOCALE_PREFIX, UPCOMING_LANGS, type Lang } from "@/lib/i18n";
import { useStore } from "./StoreProvider";
import { IconChevron } from "./icons";

const LANG_FLAG: Record<string, string> = { it: "it", en: "gb", de: "de", fr: "fr", es: "es", nl: "nl" };

function Flag({ code }: { code: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={flagUrl(code)} alt="" width={20} height={14} className="h-3.5 w-5 rounded-[2px] object-cover" loading="lazy" />;
}

function Dropdown({ label, button, children, up }: { label: string; button: React.ReactNode; children: (close: () => void) => React.ReactNode; up?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-md px-2 py-1 normal-case tracking-normal text-[0.8rem] hover:bg-white/10"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        {button}
        <IconChevron className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-[70] w-60 overflow-hidden rounded-xl border border-white/10 bg-forest-2 text-paper shadow-2xl normal-case tracking-normal ${up ? "bottom-full mb-2" : "top-full mt-1"}`}
          role="listbox"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function Selectors({ dict, up }: { dict: Dict; up?: boolean }) {
  const { lang, country, setCountry, currency, currencies, setCurrency } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const c = COUNTRIES.find((x) => x.code === country) ?? COUNTRIES[0];

  const switchLang = (to: Lang) => {
    document.cookie = `rp_lang=${to};path=/;max-age=31536000;samesite=lax`;
    const rest = pathname.replace(/^\/[a-z]{2}-[a-z]{2}/, "");
    router.push(`/${LOCALE_PREFIX[to]}${rest}`);
  };

  return (
    <div className={`flex items-center gap-1 ${up ? "justify-between" : ""}`}>
      <Dropdown label={dict.selectors.country} up={up} button={<Flag code={c.code} />}>
        {(close) => (
          <div>
            <div className="border-b border-white/10 p-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.selectors.searchCountry} className="w-full rounded-md bg-white/10 px-3 py-1.5 text-sm text-paper placeholder:text-paper/50 outline-none" />
            </div>
            <ul className="max-h-72 overflow-y-auto py-1">
              {COUNTRIES.filter((x) => x[lang].toLowerCase().includes(q.toLowerCase())).map((x) => (
                <li key={x.code}>
                  <button
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/10 ${x.code === country ? "bg-leaf/30" : ""}`}
                    onClick={() => {
                      setCountry(x.code);
                      if (currencies.some((cur) => cur.code === x.currency)) setCurrency(x.currency);
                      close();
                    }}
                  >
                    <Flag code={x.code} /> {x[lang]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Dropdown>

      <Dropdown label={dict.selectors.language} up={up} button={<><Flag code={LANG_FLAG[lang]} /> {LANG_LABEL[lang]}</>}>
        {(close) => (
          <ul className="py-1">
            {LANGS.map((l) => (
              <li key={l}>
                <button className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/10 ${l === lang ? "bg-leaf/30" : ""}`} onClick={() => (close(), switchLang(l))}>
                  <Flag code={LANG_FLAG[l]} /> {LANG_LABEL[l]}
                </button>
              </li>
            ))}
            {UPCOMING_LANGS.map((l) => (
              <li key={l.code} className="flex items-center gap-3 px-3 py-2 text-sm text-paper/40" aria-disabled>
                <Flag code={LANG_FLAG[l.code]} /> {l.label}
                <span className="ml-auto rounded-full border border-white/15 px-2 text-[0.65rem] uppercase tracking-wider">{dict.selectors.soon}</span>
              </li>
            ))}
          </ul>
        )}
      </Dropdown>

      <Dropdown label={dict.selectors.currency} up={up} button={<><Flag code={currency.flag} /> {currency.code === "EUR" ? currency.name[lang] : currency.code}</>}>
        {(close) => (
          <ul className="py-1">
            {currencies.map((cur) => (
              <li key={cur.code}>
                <button className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/10 ${cur.code === currency.code ? "bg-leaf/30" : ""}`} onClick={() => (setCurrency(cur.code), close())}>
                  <Flag code={cur.flag} /> {cur.name[lang]}
                  <span className="ml-auto text-paper/50">{cur.symbol}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Dropdown>
    </div>
  );
}
