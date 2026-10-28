"use client";

import { Thumb, UploadButton } from "./ImageInput";
import { btnSm, fieldSm } from "./ui";

export type Img = { src: string; alt: string };

export function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Lijst met afbeeldingen: volgorde, alt-tekst, pad wijzigen, verwijderen en nieuwe uploaden. */
export function ImageListEditor({ value, onChange, compact = false }: { value: Img[]; onChange: (v: Img[]) => void; compact?: boolean }) {
  const set = (i: number, patch: Partial<Img>) => onChange(value.map((img, k) => (k === i ? { ...img, ...patch } : img)));
  return (
    <div className="grid gap-2">
      {value.length === 0 && <p className="text-xs text-muted">Nog geen afbeeldingen.</p>}
      {value.map((img, i) => (
        <div key={i} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper/40 p-2">
          <Thumb src={img.src} className={compact ? "h-12 w-12" : "h-16 w-16"} />
          <div className="grid min-w-0 flex-1 gap-1.5">
            <input value={img.src} onChange={(e) => set(i, { src: e.target.value })} placeholder="/uploads/..." className={`${fieldSm} font-mono text-xs`} aria-label="Pad" />
            <input value={img.alt} onChange={(e) => set(i, { alt: e.target.value })} placeholder="Alt-tekst (beschrijving)" className={fieldSm} aria-label="Alt-tekst" />
          </div>
          <div className="flex gap-1">
            <button type="button" className={btnSm} disabled={i === 0} onClick={() => onChange(move(value, i, -1))} title="Omhoog">
              ↑
            </button>
            <button type="button" className={btnSm} disabled={i === value.length - 1} onClick={() => onChange(move(value, i, 1))} title="Omlaag">
              ↓
            </button>
            <button type="button" className={`${btnSm} text-clay`} onClick={() => onChange(value.filter((_, k) => k !== i))} title="Verwijderen">
              ✕
            </button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <UploadButton multiple label="+ Afbeelding uploaden" onUploadedMany={(urls) => onChange([...value, ...urls.map((src) => ({ src, alt: "" }))])} />
        <button type="button" className={btnSm} onClick={() => onChange([...value, { src: "", alt: "" }])}>
          + Pad invoeren
        </button>
      </div>
    </div>
  );
}
