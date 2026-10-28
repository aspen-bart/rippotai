"use client";

import { saveCategory } from "@/app/admin/actions/categories";
import { useAdminForm } from "../useAdminForm";
import { FormMessage } from "../FormMessage";
import { ImageInput } from "../ImageInput";
import { LangTabs } from "../LangTabs";
import { SubmitButton } from "../SubmitButton";
import { Label, Panel } from "../ui";

type L = { it?: string; en?: string } | null;
export type CategoryFormData = {
  id?: string;
  handle: string;
  group: string;
  parentId: string | null;
  title: L;
  tagline: L;
  description: L;
  image: string | null;
  sortOrder: number;
  published: boolean;
};

export function CategoryForm({ category, parents }: { category: CategoryFormData; parents: { id: string; label: string }[] }) {
  const { state, pending, onSubmit } = useAdminForm(saveCategory);
  return (
    <form method="post" onSubmit={onSubmit} className="grid gap-6">
      <FormMessage state={state} />
      {category.id && <input type="hidden" name="id" value={category.id} />}
      <Panel title="Inhoud">
        <LangTabs
          render={(l) => (
            <div className="grid gap-4">
              <label>
                <Label>Titel {l === "it" && "*"}</Label>
                <input name={`title_${l}`} defaultValue={category.title?.[l] ?? ""} className="field" required={l === "it"} />
              </label>
              <label>
                <Label hint="(korte slogan boven de titel)">Tagline</Label>
                <input name={`tagline_${l}`} defaultValue={category.tagline?.[l] ?? ""} className="field" />
              </label>
              <label>
                <Label hint="(HTML)">Beschrijving</Label>
                <textarea name={`description_${l}`} defaultValue={category.description?.[l] ?? ""} rows={10} className="field font-mono text-xs" />
              </label>
            </div>
          )}
        />
      </Panel>
      <Panel title="Instellingen">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <Label>Handle (URL) *</Label>
            <input name="handle" defaultValue={category.handle} className="field" required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </label>
          <label>
            <Label>Groep</Label>
            <select name="group" defaultValue={category.group} className="field">
              <option value="private">Shop Privati (particulier)</option>
              <option value="company">Shop Aziende (zakelijk)</option>
            </select>
          </label>
          <label>
            <Label>Bovenliggende categorie</Label>
            <select name="parentId" defaultValue={category.parentId ?? ""} className="field">
              <option value="">— geen (hoofdcategorie) —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Label>Volgorde</Label>
            <input name="sortOrder" type="number" defaultValue={category.sortOrder} className="field" />
          </label>
          <div className="sm:col-span-2">
            <Label>Afbeelding</Label>
            <ImageInput name="image" defaultValue={category.image ?? ""} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={category.published} className="h-4 w-4 accent-leaf" /> Gepubliceerd
          </label>
        </div>
      </Panel>
      <div>
        <SubmitButton pending={pending} pendingText="Opslaan…">Opslaan</SubmitButton>
      </div>
    </form>
  );
}
