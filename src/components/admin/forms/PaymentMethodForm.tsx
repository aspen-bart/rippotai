"use client";

import { useEffect, useRef, useState } from "react";
import { savePaymentMethod } from "@/app/admin/actions/payments";
import { FormMessage } from "../FormMessage";
import { SubmitButton } from "../SubmitButton";
import { useAdminForm } from "../useAdminForm";
import { Label, fieldSm } from "../ui";

/** Nieuwe betaalmethode toevoegen of naam/SVG van een bestaande wijzigen, met voorbeeld. */
export function PaymentMethodForm({ method }: { method?: { id: string; name: string; svg: string } }) {
  const { state, pending, onSubmit } = useAdminForm(savePaymentMethod);
  const [svg, setSvg] = useState(method?.svg ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  // Na succesvol toevoegen het formulier leegmaken.
  useEffect(() => {
    if (!method && state.ok) {
      formRef.current?.reset();
      setSvg("");
    }
  }, [state, method]);
  const looksValid = /^\s*<svg[\s>]/i.test(svg) && !/<script|\son[a-z]+\s*=|javascript:/i.test(svg);
  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} className="grid gap-3">
      <FormMessage state={state} />
      {method && <input type="hidden" name="id" value={method.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label>
          <Label>Naam</Label>
          <input name="name" defaultValue={method?.name} className={fieldSm} required />
        </label>
        {!method && (
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="enabled" defaultChecked className="h-4 w-4 accent-leaf" /> Actief
          </label>
        )}
      </div>
      <label>
        <Label hint="(volledige <svg>…</svg>-code, bv. 38×24)">SVG-logo</Label>
        <textarea name="svg" value={svg} onChange={(e) => setSvg(e.target.value)} rows={5} className={`${fieldSm} font-mono text-[11px]`} required />
      </label>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">Voorbeeld:</span>
        <span className="grid h-10 min-w-16 place-items-center rounded-md border border-line bg-white px-2 [&_svg]:h-6 [&_svg]:w-auto">
          {looksValid ? <span dangerouslySetInnerHTML={{ __html: svg }} /> : <span className="text-[10px] text-muted">–</span>}
        </span>
        <SubmitButton pending={pending} pendingText="Opslaan…" className="btn-primary ml-auto px-4 py-2">
          {method ? "Opslaan" : "Toevoegen"}
        </SubmitButton>
      </div>
    </form>
  );
}
