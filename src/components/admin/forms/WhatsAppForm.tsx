"use client";

import { useState } from "react";
import type { WhatsAppSettings } from "@/lib/settings-defaults";
import { saveWhatsApp } from "@/app/admin/actions/settings";
import { FormMessage } from "../FormMessage";
import { SubmitButton } from "../SubmitButton";
import { useAdminForm } from "../useAdminForm";
import { Label, Panel } from "../ui";

function WaIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3.2 28.8l7.1-1.8c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.7 12.7-12.7C28.8 8.6 23.1 3 16 3zm0 23.3c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.2 1.1 1.1-4.1-.3-.4c-1.1-1.7-1.7-3.6-1.7-5.6C5.2 9.8 10 5.1 16 5.1s10.7 4.8 10.7 10.6S21.9 26.3 16 26.3zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
    </svg>
  );
}

export function WhatsAppForm({ initial }: { initial: WhatsAppSettings }) {
  const { state, pending, onSubmit } = useAdminForm(saveWhatsApp);
  const [s, setS] = useState(initial);
  const [previewLang, setPreviewLang] = useState<"it" | "en">("it");
  const [mobile, setMobile] = useState(false);
  const set = <K extends keyof WhatsAppSettings>(k: K, v: WhatsAppSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const phone = s.phone.replace(/[^\d]/g, "");
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(s.message[previewLang])}`;
  const visible = s.enabled && (!mobile || s.showOnMobile);

  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="lg:col-span-2">
        <FormMessage state={state} />
      </div>
      <div className="grid content-start gap-6">
        <Panel title="Knop">
          <div className="grid gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="enabled" checked={s.enabled} onChange={(e) => set("enabled", e.target.checked)} className="h-4 w-4 accent-leaf" />
              WhatsApp-knop tonen op de website
            </label>
            <label>
              <Label hint="(internationaal, zonder + of spaties)">Telefoonnummer</Label>
              <input name="phone" value={s.phone} onChange={(e) => set("phone", e.target.value)} className="field" inputMode="tel" placeholder="390541448618" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <Label>Positie</Label>
                <select name="position" value={s.position} onChange={(e) => set("position", e.target.value as "right" | "left")} className="field">
                  <option value="right">Rechtsonder</option>
                  <option value="left">Linksonder</option>
                </select>
              </label>
              <label className="flex items-center gap-2 self-end pb-3 text-sm">
                <input type="checkbox" name="showOnMobile" checked={s.showOnMobile} onChange={(e) => set("showOnMobile", e.target.checked)} className="h-4 w-4 accent-leaf" />
                Ook op mobiel tonen
              </label>
            </div>
          </div>
        </Panel>
        <Panel title="Teksten per taal">
          <div className="grid gap-5">
            {(["it", "en"] as const).map((l) => (
              <fieldset key={l} className="grid gap-3">
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{l === "it" ? "Italiano" : "English"}</legend>
                <label>
                  <Label>Label naast de knop</Label>
                  <input
                    name={`label_${l}`}
                    value={s.label[l]}
                    onChange={(e) => set("label", { ...s.label, [l]: e.target.value })}
                    onFocus={() => setPreviewLang(l)}
                    className="field"
                  />
                </label>
                <label>
                  <Label>Vooringevuld bericht</Label>
                  <textarea
                    name={`message_${l}`}
                    value={s.message[l]}
                    onChange={(e) => set("message", { ...s.message, [l]: e.target.value })}
                    onFocus={() => setPreviewLang(l)}
                    rows={2}
                    className="field"
                  />
                </label>
              </fieldset>
            ))}
          </div>
        </Panel>
        <div>
          <SubmitButton pending={pending} pendingText="Opslaan…">
            Opslaan
          </SubmitButton>
        </div>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Panel title="Live voorbeeld">
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {(["it", "en"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setPreviewLang(l)} className={`rounded-full px-3 py-1 ${previewLang === l ? "bg-forest text-paper" : "bg-paper-2 text-muted"}`}>
                {l.toUpperCase()}
              </button>
            ))}
            <span className="mx-1 w-px bg-line" />
            <button type="button" onClick={() => setMobile(false)} className={`rounded-full px-3 py-1 ${!mobile ? "bg-forest text-paper" : "bg-paper-2 text-muted"}`}>
              Desktop
            </button>
            <button type="button" onClick={() => setMobile(true)} className={`rounded-full px-3 py-1 ${mobile ? "bg-forest text-paper" : "bg-paper-2 text-muted"}`}>
              Mobiel
            </button>
          </div>
          <div className={`paper-grain relative mx-auto overflow-hidden rounded-2xl border border-line bg-paper ${mobile ? "h-96 w-52" : "h-72 w-full"}`}>
            <div className="space-y-2 p-4">
              <div className="h-3 w-24 rounded bg-forest/20" />
              <div className="h-2 w-full rounded bg-line" />
              <div className="h-2 w-5/6 rounded bg-line" />
              <div className="h-2 w-2/3 rounded bg-line" />
            </div>
            {visible ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`absolute bottom-4 flex items-center gap-2 ${s.position === "left" ? "left-4 flex-row-reverse" : "right-4"}`}
              >
                {!mobile && s.label[previewLang] && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-md">{s.label[previewLang]}</span>}
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg">
                  <WaIcon />
                </span>
              </a>
            ) : (
              <p className="absolute inset-x-0 bottom-4 text-center text-xs text-muted">{s.enabled ? "Niet zichtbaar op mobiel" : "Knop staat uit"}</p>
            )}
          </div>
          <p className="mt-3 break-all text-xs text-muted">
            Link: <span className="font-mono">{href}</span>
          </p>
        </Panel>
      </div>
    </form>
  );
}
