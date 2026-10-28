"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { saveSetting } from "@/lib/settings";
import type { WhatsAppSettings } from "@/lib/settings-defaults";
import { parseEuro } from "@/lib/admin/money";
import { checkbox, firstIssue, loc, parseJson, revalidateSite, str, type FormState } from "@/lib/admin/common";

const whatsappSchema = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/[^\d]/g, ""))
    .pipe(z.string().min(8, "Telefoonnummer is te kort (internationaal formaat, bv. 390541448618)").max(16, "Telefoonnummer is te lang")),
  position: z.enum(["right", "left"]),
});

export async function saveWhatsApp(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = whatsappSchema.safeParse({ phone: str(form, "phone"), position: str(form, "position") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const value: WhatsAppSettings = {
    enabled: checkbox(form, "enabled"),
    phone: parsed.data.phone,
    label: loc(form, "label"),
    message: loc(form, "message"),
    position: parsed.data.position,
    showOnMobile: checkbox(form, "showOnMobile"),
  };
  await saveSetting("whatsapp", value);
  revalidateSite();
  return { ok: "WhatsApp-instellingen opgeslagen." };
}

const url = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\//.test(v), "Sociale links moeten met https:// beginnen");

export async function saveStore(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const shipping = parseEuro(str(form, "shipping"));
  const freeFrom = parseEuro(str(form, "freeFrom"));
  if (Number.isNaN(shipping) || Number.isNaN(freeFrom)) return { error: "Ongeldig bedrag bij verzendkosten" };
  const social = z.object({ instagram: url, facebook: url, youtube: url, tiktok: url }).safeParse({
    instagram: str(form, "instagram"),
    facebook: str(form, "facebook"),
    youtube: str(form, "youtube"),
    tiktok: str(form, "tiktok"),
  });
  if (!social.success) return { error: firstIssue(social.error) };
  const company = z
    .object({
      name: z.string().trim().min(1, "Bedrijfsnaam is verplicht").max(200),
      legal: z.string().trim().max(200),
      vat: z.string().trim().max(50),
      phone: z.string().trim().max(50),
      email: z.union([z.literal(""), z.string().trim().email("Ongeldig e-mailadres")]),
      pec: z.string().trim().max(200),
      headquarters: z.string().trim().max(300),
      registeredOffice: z.string().trim().max(300),
    })
    .safeParse(Object.fromEntries(["name", "legal", "vat", "phone", "email", "pec", "headquarters", "registeredOffice"].map((k) => [k, str(form, `company_${k}`).trim()])));
  if (!company.success) return { error: firstIssue(company.error) };

  await saveSetting("store", {
    announcement: loc(form, "announcement"),
    shippingCents: shipping ?? 0,
    freeShippingFromCents: freeFrom ?? 0,
    company: company.data,
    social: social.data,
  });
  revalidateSite();
  return { ok: "Winkelinstellingen opgeslagen." };
}

const currencySchema = z
  .array(
    z.object({
      code: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{3}$/, "Valutacode moet 3 letters zijn (ISO 4217)"),
      name: z.object({ it: z.string().trim().max(80), en: z.string().trim().max(80) }),
      symbol: z.string().trim().min(1, "Symbool is verplicht").max(6),
      rate: z.coerce.number().positive("Wisselkoers moet groter dan 0 zijn").max(100000),
      flag: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z]{2}$/, "Vlag-code moet 2 letters zijn (bv. us)"),
    }),
  )
  .min(1)
  .max(40);

export async function saveCurrency(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = currencySchema.safeParse(parseJson(form.get("currencies")));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const list = parsed.data;
  const codes = list.map((c) => c.code);
  if (new Set(codes).size !== codes.length) return { error: "Elke valutacode mag maar één keer voorkomen" };
  const eur = list.find((c) => c.code === "EUR");
  if (!eur) return { error: "EUR is de basisvaluta en kan niet verwijderd worden" };
  eur.rate = 1;
  // EUR altijd bovenaan.
  const currencies = [eur, ...list.filter((c) => c.code !== "EUR")];
  await saveSetting("currency", { base: "EUR", currencies });
  revalidateSite();
  return { ok: "Valuta opgeslagen." };
}
