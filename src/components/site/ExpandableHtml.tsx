"use client";

import { useState } from "react";

// Lange (Shopify-)beschrijvingen ingeklapt tonen met een zachte fade.
export function ExpandableHtml({ html, more, less, collapsedHeight = 260 }: { html: string; more: string; less: string; collapsedHeight?: number }) {
  const [open, setOpen] = useState(false);
  const long = html.replace(/<[^>]+>/g, "").length > 650;
  return (
    <div>
      <div
        className="prose-eco relative overflow-hidden transition-[max-height] duration-700 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-leaf-dark"
        style={{ maxHeight: long && !open ? collapsedHeight : 4000 }}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {long && !open && <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent" />}
      </div>
      {long && (
        <button onClick={() => setOpen(!open)} className="mt-4 text-sm font-medium text-forest underline decoration-sprout decoration-2 underline-offset-4">
          {open ? less : more}
        </button>
      )}
    </div>
  );
}
