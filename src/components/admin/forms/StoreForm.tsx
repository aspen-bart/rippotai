"use client";

import type { StoreSettings } from "@/lib/settings-defaults";
import { centsToInput } from "@/lib/admin/money";
import { saveStore } from "@/app/admin/actions/settings";
import { FormMessage } from "../FormMessage";
import { SubmitButton } from "../SubmitButton";
import { useAdminForm } from "../useAdminForm";
import { Label, Panel } from "../ui";

const COMPANY: { key: keyof StoreSettings["company"]; label: string }[] = [
  { key: "name", label: "Bedrijfsnaam *" },
  { key: "legal", label: "Rechtsvorm" },
  { key: "vat", label: "Btw-nummer (P.IVA)" },
  { key: "phone", label: "Telefoon" },
  { key: "email", label: "E-mail" },
  { key: "pec", label: "PEC" },
  { key: "headquarters", label: "Vestigingsadres (sede operativa)" },
  { key: "registeredOffice", label: "Statutair adres (sede legale)" },
];

export function StoreForm({ initial }: { initial: StoreSettings }) {
  const { state, pending, onSubmit } = useAdminForm(saveStore);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-6">
      <FormMessage state={state} />
      <Panel title="Aankondigingsbalk">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["it", "en"] as const).map((l) => (
            <label key={l}>
              <Label>{l === "it" ? "Italiano" : "English"}</Label>
              <input name={`announcement_${l}`} defaultValue={initial.announcement[l]} className="field" placeholder="Leeg = geen balk" />
            </label>
          ))}
        </div>
      </Panel>
      <Panel title="Verzending">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <Label hint="(€, 0 = gratis)">Verzendkosten</Label>
            <input name="shipping" defaultValue={centsToInput(initial.shippingCents)} className="field" inputMode="decimal" />
          </label>
          <label>
            <Label hint="(€, 0 = niet van toepassing)">Gratis verzending vanaf</Label>
            <input name="freeFrom" defaultValue={centsToInput(initial.freeShippingFromCents)} className="field" inputMode="decimal" />
          </label>
        </div>
      </Panel>
      <Panel title="Bedrijfsgegevens">
        <div className="grid gap-4 sm:grid-cols-2">
          {COMPANY.map((f) => (
            <label key={f.key}>
              <Label>{f.label}</Label>
              <input name={`company_${f.key}`} defaultValue={initial.company[f.key]} className="field" type={f.key === "email" ? "email" : "text"} />
            </label>
          ))}
        </div>
      </Panel>
      <Panel title="Sociale media">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["instagram", "facebook", "youtube", "tiktok"] as const).map((k) => (
            <label key={k}>
              <Label>{k[0].toUpperCase() + k.slice(1)}</Label>
              <input name={k} defaultValue={initial.social[k]} className="field" type="url" placeholder="https://" />
            </label>
          ))}
        </div>
      </Panel>
      <div>
        <SubmitButton pending={pending} pendingText="Opslaan…">
          Winkelinstellingen opslaan
        </SubmitButton>
      </div>
    </form>
  );
}
