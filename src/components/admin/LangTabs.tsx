"use client";

import { useState } from "react";

export type AdminLang = "it" | "en";
const LABELS: Record<AdminLang, string> = { it: "IT · Italiano", en: "EN · English" };

/** Tabs per taal. Beide talen blijven in de DOM (alleen verborgen), zodat ongecontroleerde velden meegaan bij verzenden. */
export function LangTabs({ render, extra }: { render: (lang: AdminLang) => React.ReactNode; extra?: React.ReactNode }) {
  const [lang, setLang] = useState<AdminLang>("it");
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-line" role="tablist">
        {(Object.keys(LABELS) as AdminLang[]).map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={lang === l}
            onClick={() => setLang(l)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition ${lang === l ? "border-leaf font-medium text-forest" : "border-transparent text-muted hover:text-forest"}`}
          >
            {LABELS[l]}
          </button>
        ))}
        {extra && <div className="ml-auto">{extra}</div>}
      </div>
      {(Object.keys(LABELS) as AdminLang[]).map((l) => (
        <div key={l} hidden={lang !== l}>
          {render(l)}
        </div>
      ))}
    </div>
  );
}
