"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { t } from "@/lib/i18n";

export type FormState = { ok: boolean; error?: string; orderNumber?: number } | null;

const newsletterSchema = z.object({ email: z.string().email().max(200), consent: z.literal("on"), marketing: z.string().optional() });

export async function subscribeNewsletter(_: FormState, form: FormData): Promise<FormState> {
  const parsed = newsletterSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { email, marketing } = parsed.data;
  await db.newsletterSubscriber.upsert({
    where: { email: email.toLowerCase() },
    update: { marketing: marketing === "on" },
    create: { email: email.toLowerCase(), marketing: marketing === "on" },
  });
  return { ok: true };
}

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  message: z.string().trim().min(5).max(5000),
  consent: z.literal("on"),
  website: z.string().max(0).optional(), // honeypot
});

export async function sendContact(_: FormState, form: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { name, email, phone, company, message } = parsed.data;
  await db.contactMessage.create({ data: { name, email, phone: phone || null, company: company || null, message } });
  return { ok: true };
}

const orderSchema = z.object({
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(1).max(100),
  zip: z.string().trim().min(2).max(20),
  country: z.string().length(2),
  note: z.string().max(1000).optional(),
  payment: z.string().min(1).max(60),
  consent: z.literal("on"),
  locale: z.enum(["it", "en"]),
  currency: z.string().max(3),
  items: z.string(),
});

const itemsSchema = z.array(z.object({ variantId: z.string(), qty: z.number().int().min(1).max(99) })).min(1).max(50);

/** Bestelling aanmaken. Prijzen komen altijd uit de database, nooit uit de browser. Afrekenen gebeurt in EUR. */
export async function placeOrder(_: FormState, form: FormData): Promise<FormState> {
  const parsed = orderSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;
  let wanted: z.infer<typeof itemsSchema>;
  try {
    wanted = itemsSchema.parse(JSON.parse(data.items));
  } catch {
    return { ok: false, error: "cart" };
  }

  const method = await db.paymentMethod.findFirst({ where: { key: data.payment, enabled: true } });
  if (!method) return { ok: false, error: "payment" };

  const variants = await db.productVariant.findMany({
    where: { id: { in: wanted.map((w) => w.variantId) }, available: true, product: { published: true } },
    include: { product: true },
  });
  const items = wanted.flatMap((w) => {
    const v = variants.find((x) => x.id === w.variantId);
    if (!v) return [];
    const images = (v.product.images as { src: string }[]) ?? [];
    return [{
      productId: v.productId,
      handle: v.product.handle,
      title: t(v.product.title, data.locale),
      variantTitle: v.title === "Default Title" ? null : v.title,
      qty: w.qty,
      priceCents: v.priceCents,
      image: images[0]?.src ?? null,
    }];
  });
  if (!items.length) return { ok: false, error: "cart" };

  const store = await getSetting("store");
  const subtotal = items.reduce((s, i) => s + i.qty * i.priceCents, 0);
  const shipping = store.freeShippingFromCents > 0 && subtotal >= store.freeShippingFromCents ? 0 : store.shippingCents;

  const last = await db.order.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
  const order = await db.order.create({
    data: {
      number: (last?.number ?? 1000) + 1,
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone || null,
      address: { address: data.address, city: data.city, zip: data.zip, country: data.country },
      items,
      subtotalCents: subtotal,
      shippingCents: shipping,
      totalCents: subtotal + shipping,
      currency: "EUR",
      paymentMethod: method.name,
      locale: data.locale,
      note: [data.note, data.currency !== "EUR" ? `Valuta getoond aan klant: ${data.currency}` : ""].filter(Boolean).join("\n") || null,
    },
  });
  // TODO betaalprovider (bv. Mollie/Stripe) koppelen: hier een betaling starten en doorsturen.
  return { ok: true, orderNumber: order.number };
}
