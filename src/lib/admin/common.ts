import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/** Resultaat van formulier-acties (useActionState). */
export type FormState = { error?: string; ok?: string };

export const localized = z.object({ it: z.string().default(""), en: z.string().default("") });
export type Loc = z.infer<typeof localized>;

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Handle is verplicht")
  .max(150)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Handle mag alleen kleine letters, cijfers en streepjes bevatten");

export const optionalHandle = z
  .string()
  .trim()
  .toLowerCase()
  .max(150)
  .refine((v) => v === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), "Handle mag alleen kleine letters, cijfers en streepjes bevatten")
  .transform((v) => v || null);

/** Lokaal pad (/...) of https-URL, anders null. */
export const imagePath = z
  .string()
  .trim()
  .max(500)
  .transform((v) => (v.startsWith("/") || v.startsWith("https://") ? v : null));

export const checkbox = (form: FormData, name: string) => form.get(name) === "on" || form.get(name) === "true";

/** Tekstveld uit FormData; textarea's worden door browsers met CRLF verzonden → normaliseren naar LF. */
export function str(form: FormData, name: string) {
  return String(form.get(name) ?? "").replace(/\r\n?/g, "\n");
}

export function loc(form: FormData, name: string): Loc {
  return { it: str(form, `${name}_it`).trim(), en: str(form, `${name}_en`).trim() };
}

const PATH_LABELS: Record<string, string> = { variants: "Variant", images: "Afbeelding", sections: "Secties", ctas: "Knop", it: "IT", en: "EN" };

/** Eerste zod-fout als leesbare melding, bv. "Variant 2: Prijs is verplicht". */
export function firstIssue(err: z.ZodError) {
  const i = err.issues[0];
  if (!i) return "Ongeldige invoer";
  const where: string[] = [];
  i.path.forEach((p, k) => {
    if (typeof p === "number") where.push(`${where.length ? "" : "Rij "}${p + 1}`);
    else if (PATH_LABELS[p] && k < i.path.length - 1) where.push(PATH_LABELS[p]);
  });
  return `${where.length ? where.join(" ") + ": " : ""}${i.message}`;
}

export function parseJson(value: FormDataEntryValue | null): unknown {
  try {
    return JSON.parse(String(value ?? ""));
  } catch {
    return undefined;
  }
}

/** Publieke site + beheer opnieuw laten renderen na een wijziging. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

/** Prisma unique-constraint fout? */
export function isUniqueError(e: unknown) {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
}
