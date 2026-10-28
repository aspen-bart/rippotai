"use client";

import { useState } from "react";
import { savePage } from "@/app/admin/actions/pages";
import { FormMessage } from "../FormMessage";
import { ImageListEditor, move, type Img } from "../ImageListEditor";
import { LangTabs, type AdminLang } from "../LangTabs";
import { SubmitButton } from "../SubmitButton";
import { useAdminForm } from "../useAdminForm";
import { Label, Panel, btnSm, fieldSm } from "../ui";

type L = { it?: string; en?: string } | null;
export type Section = { html: string; images: Img[]; ctas: { label: string; href: string }[] };
export type PageFormData = {
  id?: string;
  handle: string;
  handleEn: string;
  title: L;
  description: L;
  sections: { it: Section[]; en: Section[] };
  published: boolean;
};

const emptySection = (): Section => ({ html: "", images: [], ctas: [] });

export function PageForm({ page }: { page: PageFormData }) {
  const { state, pending, onSubmit } = useAdminForm(savePage);
  const [sections, setSections] = useState(page.sections);
  const update = (l: AdminLang, fn: (list: Section[]) => Section[]) => setSections((s) => ({ ...s, [l]: fn(s[l]) }));
  const patch = (l: AdminLang, i: number, p: Partial<Section>) => update(l, (list) => list.map((s, k) => (k === i ? { ...s, ...p } : s)));

  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-6">
      <FormMessage state={state} />
      <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      {page.id && <input type="hidden" name="id" value={page.id} />}

      <Panel title="Algemeen">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label>
            <Label>Handle IT *</Label>
            <input name="handle" defaultValue={page.handle} className="field" required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </label>
          <label>
            <Label hint="(optioneel)">Handle EN</Label>
            <input name="handleEn" defaultValue={page.handleEn} className="field" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </label>
          <label className="flex items-center gap-2 pb-3 text-sm">
            <input type="checkbox" name="published" defaultChecked={page.published} className="h-4 w-4 accent-leaf" /> Gepubliceerd
          </label>
        </div>
      </Panel>

      <Panel>
        <LangTabs
          extra={
            <SubmitButton pending={pending} pendingText="Opslaan…" className="btn-primary px-5 py-2">
              Opslaan
            </SubmitButton>
          }
          render={(l) => (
            <div className="grid gap-5">
              <label>
                <Label>Titel {l === "it" && "*"}</Label>
                <input name={`title_${l}`} defaultValue={page.title?.[l] ?? ""} className="field" required={l === "it"} />
              </label>
              <label>
                <Label hint="(voor zoekmachines, ± 155 tekens)">Meta-description</Label>
                <textarea name={`description_${l}`} defaultValue={page.description?.[l] ?? ""} rows={3} className="field" />
              </label>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-forest">Secties ({sections[l].length})</h3>
                {l === "en" && sections.it.length > 0 && sections.en.length === 0 && (
                  <button type="button" className={btnSm} onClick={() => update("en", () => structuredClone(sections.it))}>
                    Kopieer secties van IT
                  </button>
                )}
              </div>
              {sections[l].map((s, i) => (
                <div key={i} className="rounded-2xl border border-line bg-paper/40 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">Sectie {i + 1}</span>
                    <div className="flex gap-1">
                      <button type="button" className={btnSm} disabled={i === 0} onClick={() => update(l, (list) => move(list, i, -1))} title="Omhoog">
                        ↑
                      </button>
                      <button type="button" className={btnSm} disabled={i === sections[l].length - 1} onClick={() => update(l, (list) => move(list, i, 1))} title="Omlaag">
                        ↓
                      </button>
                      <button
                        type="button"
                        className={`${btnSm} text-clay`}
                        onClick={() => window.confirm("Sectie verwijderen?") && update(l, (list) => list.filter((_, k) => k !== i))}
                      >
                        Verwijderen
                      </button>
                    </div>
                  </div>
                  <label>
                    <Label>HTML</Label>
                    <textarea value={s.html} onChange={(e) => patch(l, i, { html: e.target.value })} rows={8} className={`${fieldSm} font-mono text-xs`} />
                  </label>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Afbeeldingen</Label>
                      <ImageListEditor compact value={s.images} onChange={(images) => patch(l, i, { images })} />
                    </div>
                    <div>
                      <Label>Knoppen (CTA)</Label>
                      <div className="grid gap-2">
                        {s.ctas.map((c, k) => (
                          <div key={k} className="flex gap-2">
                            <input
                              value={c.label}
                              onChange={(e) => patch(l, i, { ctas: s.ctas.map((x, j) => (j === k ? { ...x, label: e.target.value } : x)) })}
                              placeholder="Label"
                              className={fieldSm}
                            />
                            <input
                              value={c.href}
                              onChange={(e) => patch(l, i, { ctas: s.ctas.map((x, j) => (j === k ? { ...x, href: e.target.value } : x)) })}
                              placeholder="/it-it/pages/..."
                              className={`${fieldSm} font-mono text-xs`}
                            />
                            <button type="button" className={`${btnSm} text-clay`} onClick={() => patch(l, i, { ctas: s.ctas.filter((_, j) => j !== k) })} title="Verwijderen">
                              ✕
                            </button>
                          </div>
                        ))}
                        <button type="button" className={`${btnSm} justify-self-start`} onClick={() => patch(l, i, { ctas: [...s.ctas, { label: "", href: "" }] })}>
                          + Knop
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn-ghost justify-self-start px-4 py-2 text-forest" onClick={() => update(l, (list) => [...list, emptySection()])}>
                + Sectie toevoegen
              </button>
            </div>
          )}
        />
      </Panel>
      <div>
        <SubmitButton pending={pending} pendingText="Opslaan…">
          Opslaan
        </SubmitButton>
      </div>
    </form>
  );
}
