"use client";

import { useRef, useState } from "react";
import { btnSm, fieldSm } from "./ui";

/** Uploadt een afbeelding naar /api/admin/upload en geeft de URL terug. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "Upload mislukt");
  return data.url;
}

export function UploadButton({
  onUploaded,
  onUploadedMany,
  label = "Uploaden",
  multiple = false,
}: {
  onUploaded?: (url: string) => void;
  /** alle URL's in één keer (na afloop), handig bij meerdere bestanden */
  onUploadedMany?: (urls: string[]) => void;
  label?: string;
  multiple?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <span className="inline-flex flex-col">
      <button type="button" className={btnSm} disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? "Uploaden…" : label}
      </button>
      <input
        ref={ref}
        type="file"
        hidden
        multiple={multiple}
        accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.avif"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          setError("");
          const urls: string[] = [];
          try {
            for (const f of files) {
              const url = await uploadImage(f);
              urls.push(url);
              onUploaded?.(url);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload mislukt");
          } finally {
            if (urls.length) onUploadedMany?.(urls);
            setBusy(false);
          }
        }}
      />
      {error && <span className="mt-1 text-xs text-clay">{error}</span>}
    </span>
  );
}

export function Thumb({ src, className = "h-14 w-14" }: { src?: string | null; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`${className} shrink-0 rounded-lg border border-line bg-paper object-cover`} />
  ) : (
    <span className={`${className} grid shrink-0 place-items-center rounded-lg border border-dashed border-line bg-paper text-[10px] text-muted`}>geen</span>
  );
}

/** Afbeeldingspad als tekstveld + uploadknop + voorbeeld. Met `name` werkt het in een gewoon formulier. */
export function ImageInput({
  name,
  defaultValue = "",
  value,
  onChange,
  placeholder = "/images/... of upload",
}: {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const set = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };
  return (
    <div className="flex items-start gap-3">
      <Thumb src={current} />
      <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
        <input name={name} value={current} onChange={(e) => set(e.target.value)} placeholder={placeholder} className={`${fieldSm} min-w-0 flex-1`} />
        <UploadButton onUploaded={set} />
      </div>
    </div>
  );
}
