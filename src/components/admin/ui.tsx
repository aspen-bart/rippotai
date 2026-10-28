// Gedeelde presentatiecomponenten voor het beheer (server- én client-veilig: geen hooks).

export function PageHeader({ title, description, action }: { title: string; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-forest">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function Panel({ children, className = "", title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-forest/80">{title}</h2>}
      {children}
    </section>
  );
}

type Tone = "neutral" | "success" | "warning" | "danger" | "brand";
const TONES: Record<Tone, string> = {
  neutral: "bg-paper-2 text-muted",
  success: "bg-leaf/15 text-leaf-dark",
  warning: "bg-sun/25 text-[#7a5a10]",
  danger: "bg-clay/15 text-clay",
  brand: "bg-forest text-paper",
};
export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>{children}</span>;
}

export function Notice({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "danger" }) {
  return (
    <p className={`mb-5 rounded-xl px-4 py-3 text-sm ${tone === "success" ? "bg-leaf/10 text-leaf-dark" : "bg-clay/10 text-clay"}`} role="status">
      {children}
    </p>
  );
}

export function Label({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-medium text-muted">
      {children}
      {hint && <span className="ml-1 font-normal text-muted/70">{hint}</span>}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line bg-white/60 p-8 text-center text-sm text-muted">{children}</p>;
}

export const btnSm = "inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-forest transition hover:border-forest disabled:opacity-40";
export const btnSmDanger = "inline-flex items-center gap-1.5 rounded-full border border-clay/30 bg-white px-3 py-1.5 text-xs font-medium text-clay transition hover:bg-clay hover:text-white disabled:opacity-40";
export const fieldSm = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20";

const dt = new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Rome", dateStyle: "medium", timeStyle: "short" });
const d = new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Rome", dateStyle: "medium" });
export const fmtDateTime = (v: Date | null | undefined) => (v ? dt.format(v) : "–");
export const fmtDate = (v: Date | null | undefined) => (v ? d.format(v) : "–");

/** Vertaalbaar JSON-veld → tekst (Italiaans eerst). */
export function tr(v: unknown, lang: "it" | "en" = "it"): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  const o = v as Record<string, string | undefined>;
  return o[lang] || o.it || o.en || "";
}

export const ORDER_STATUSES = [
  { value: "pending", label: "In afwachting", tone: "warning" },
  { value: "paid", label: "Betaald", tone: "success" },
  { value: "shipped", label: "Verzonden", tone: "brand" },
  { value: "completed", label: "Afgerond", tone: "neutral" },
  { value: "cancelled", label: "Geannuleerd", tone: "danger" },
] as const satisfies readonly { value: string; label: string; tone: Tone }[];

export function OrderStatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUSES.find((x) => x.value === status);
  return <Badge tone={s?.tone ?? "neutral"}>{s?.label ?? status}</Badge>;
}
