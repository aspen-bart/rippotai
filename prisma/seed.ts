// Vult de database met de gescrapete content uit content/*.json, standaardinstellingen en de eerste beheerder.
// Opnieuw draaien is veilig: bestaande records worden bijgewerkt (upsert op handle/key).
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS } from "../src/lib/settings-defaults";

const db = new PrismaClient();
const read = <T,>(name: string): T => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", name), "utf8"));
const cents = (n: number | null | undefined) => (n == null ? null : Math.round(n * 100));

type L = { it: string; en: string };
type ScrapedCollection = { handle: string; parent: string | null; group: string; image: string | null; title: L; description: L };
type ScrapedProduct = {
  handle: string;
  handleEn: string;
  title: L;
  body: L;
  vendor: string;
  productType: string;
  tags: string[];
  options: { name: L; values: string[] }[];
  variants: { title: string; sku: string; price: number; compareAtPrice: number | null; available: boolean; options: string[] }[];
  images: { src: string; alt: string }[];
  categories: string[];
};
type ScrapedPage = { handle: string; handleEn: string; title: L; description: L; sections: { it: unknown[]; en: unknown[] } };

// Op de bronsite zijn categorietitels SEO-zinnen en vaak niet vertaald. Hier staan de nette namen,
// slogans en (waar de Engelse tekst ontbrak) een Engelse beschrijving.
const CATEGORY_COPY: Record<string, { title: L; tagline: L; image?: string; descriptionEn?: string; descriptionIt?: string }> = {
  "cartoleria-ecologica-e-piantabile": {
    title: { it: "Cartoleria ecologica", en: "Eco-friendly stationery" },
    tagline: { it: "Scrivi, pianta, sogna green", en: "Write, plant, dream green" },
    image: "/images/home/img-1.jpg",
    descriptionIt:
      "<p>Scrivi, regala e aiuta a crescere. La nostra cartoleria unisce sostenibilità e impegno sociale: le carte <strong>Recharta</strong> e <strong>Releaf</strong> sono fatte a mano nella <strong>cartiera ManoLibera, all'interno del carcere di Forlì</strong>, grazie al progetto di inclusione lavorativa <strong>altreMANI</strong>.</p><p>Ogni foglio contiene semi biodegradabili che, una volta piantati, danno vita a fiori e piante. Perfetta per biglietti, inviti e messaggi speciali che si trasformano in natura.</p>",
    descriptionEn:
      "<p>Write, give and help things grow. Our stationery combines sustainability and social commitment: <strong>Recharta</strong> and <strong>Releaf</strong> papers are handmade at the <strong>ManoLibera paper mill inside the Forlì prison</strong>, through the <strong>altreMANI</strong> work-inclusion project.</p><p>Every sheet contains biodegradable seeds that, once planted, grow into flowers and plants. Perfect for greeting cards, invitations and special messages that turn into nature.</p>",
  },
  "carta-piantabile-personalizzata": {
    title: { it: "Carta piantabile", en: "Plantable paper" },
    tagline: { it: "Fatta a mano nel carcere di Forlì", en: "Handmade in the Forlì prison" },
    descriptionEn:
      "<p>Plantable paper made by hand inside the Forlì prison: every card, bookmark and coaster contains seeds that bloom once planted. A solidarity gift that supports the reintegration of inmates through dignified work.</p>",
  },
  "biglietti-auguri-con-semi": {
    title: { it: "Biglietti di auguri con semi", en: "Greeting cards with seeds" },
    tagline: { it: "Auguri che fioriscono", en: "Wishes that bloom" },
    descriptionEn: "<p>Greeting cards in seed paper for every occasion: after reading them, plant them and watch your wishes grow into wildflowers.</p>",
  },
  "matita-piantabile": {
    title: { it: "Matite piantabili", en: "Plantable pencils" },
    tagline: { it: "Quando finisce, comincia", en: "When it ends, it begins" },
    descriptionEn:
      "<p>Not just a wooden pencil: the <strong>plantable pencil</strong> has a seed capsule at the end. When it gets too short to write with, plant it and grow chamomile, wormwood or wildflowers. An ideal gadget for hotels, events and conferences.</p>",
  },
  "quaderni-e-notebook": {
    title: { it: "Quaderni ecologici", en: "Ecological notebooks" },
    tagline: { it: "Pagine riciclate, idee nuove", en: "Recycled pages, fresh ideas" },
    descriptionEn: "<p>Notebooks and diaries in recycled and plantable paper: sustainable design for every day, for the office and as a thoughtful gift.</p>",
  },
  "bombe-di-semi": {
    title: { it: "Bombe di semi", en: "Seed bombs" },
    tagline: { it: "Lancia, aspetta, fiorisci", en: "Throw, wait, bloom" },
    descriptionEn: "<p>Seed bombs made of clay, soil and seeds: an ecological gift idea that brings flowers for bees and pollinators to gardens, balconies and city corners.</p>",
  },
  "sottopiatti-e-tovagliette-in-carta": {
    title: { it: "Tovagliette eco", en: "Eco placemats" },
    tagline: { it: "La tavola che rispetta il pianeta", en: "A table that respects the planet" },
    descriptionEn:
      "<p>Paper placemats and chargers for restaurants, hotels and events: elegant, reusable or compostable, and customisable with your brand. Set a table your guests will remember.</p>",
  },
  "ventagli-di-carta": {
    title: { it: "Ventagli di carta", en: "Paper fans" },
    tagline: { it: "Leggeri, sostenibili, di design", en: "Light, sustainable, designed" },
  },
  "soluzioni-sostenibili-per-hotel-e-hospitality": {
    title: { it: "Hotel & Ristoranti", en: "Hotels & Restaurants" },
    tagline: { it: "Ospitalità sostenibile, firmata Rippotai", en: "Sustainable hospitality, by Rippotai" },
    image: "/images/collections/sottopiatti-e-tovagliette-in-carta.jpg",
    descriptionIt:
      "<p>Soluzioni sostenibili per <strong>hotel, ristoranti, B&amp;B e spazi di accoglienza</strong>: tovagliette e sottopiatti in carta, kit di benvenuto in carta piantabile, matite con semi per le camere e le sale meeting, gadget personalizzati e allestimenti in cartone riciclabile.</p><p>Progettiamo insieme a te: ogni prodotto può essere personalizzato con il tuo logo e racconta ai tuoi ospiti una scelta concreta per il pianeta e per le persone.</p>",
    descriptionEn:
      "<p>Sustainable solutions for <strong>hotels, restaurants, B&amp;Bs and hospitality venues</strong>: paper placemats and chargers, welcome kits in plantable paper, seed pencils for rooms and meeting rooms, branded gadgets and recyclable cardboard displays.</p><p>We co-design with you: every product can carry your logo and tells your guests about a concrete choice for the planet and for people.</p>",
  },
  "green-gadgets": {
    title: { it: "Gadget green", en: "Green gadgets" },
    tagline: { it: "Il tuo brand, in versione sostenibile", en: "Your brand, the sustainable way" },
  },
  "allestimenti-allestimenti-ecosostenibili-su-misura": {
    title: { it: "Allestimenti ecosostenibili", en: "Sustainable displays" },
    tagline: { it: "Eventi e fiere in cartone riciclabile", en: "Events and fairs in recyclable cardboard" },
    descriptionEn:
      "<p>Custom sustainable displays for events, trade fairs and pop-up stores: backdrops, tables, counters and games in recyclable cardboard, printed with water-based inks.</p>",
  },
  "quadri-motivazionali": {
    title: { it: "Quadri motivazionali", en: "Motivational paintings" },
    tagline: { it: "Parole che arredano", en: "Words that decorate" },
  },
};

async function main() {
  // --- Beheerder ---
  const email = process.env.ADMIN_EMAIL || "admin@rippotai.it";
  const password = process.env.ADMIN_PASSWORD;
  if (password) {
    await db.user.upsert({
      where: { email },
      update: {},
      create: { email, name: "Beheerder", passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log(`Beheerder: ${email}`);
  } else {
    console.warn("ADMIN_PASSWORD ontbreekt in .env: geen beheerder aangemaakt.");
  }

  // --- Categorieën ---
  const collections = read<ScrapedCollection[]>("collections.json");
  const catId = new Map<string, string>();
  for (const [i, c] of collections.entries()) {
    const copy = CATEGORY_COPY[c.handle];
    const description = {
      it: copy?.descriptionIt || c.description.it,
      en: copy?.descriptionEn || (c.description.en && c.description.en !== c.description.it ? c.description.en : "") || c.description.it,
    };
    const data = {
      group: c.group,
      title: copy?.title ?? c.title,
      tagline: copy?.tagline ?? Prisma.JsonNull,
      description,
      image: copy?.image ?? c.image,
      sortOrder: i,
    };
    const row = await db.category.upsert({ where: { handle: c.handle }, update: data, create: { handle: c.handle, ...data } });
    catId.set(c.handle, row.id);
  }
  for (const c of collections) {
    if (c.parent) await db.category.update({ where: { handle: c.handle }, data: { parentId: catId.get(c.parent) } });
  }
  // Parent zonder eigen beeld: beeld van eerste subcategorie
  console.log(`Categorieën: ${collections.length}`);

  // --- Producten ---
  const products = read<ScrapedProduct[]>("products.json");
  for (const [i, p] of products.entries()) {
    const prices = p.variants.map((v) => v.price);
    const min = Math.min(...prices);
    const cheapest = p.variants.find((v) => v.price === min);
    const data = {
      handleEn: p.handleEn !== p.handle ? p.handleEn : null,
      title: p.title,
      body: p.body,
      vendor: p.vendor,
      productType: p.productType,
      tags: p.tags,
      options: p.options,
      images: p.images,
      priceCents: cents(min)!,
      compareCents: cents(cheapest?.compareAtPrice),
      featured: i % 4 === 0,
      sortOrder: i,
      categories: { set: p.categories.filter((h) => catId.has(h)).map((h) => ({ id: catId.get(h)! })) },
    };
    const row = await db.product.upsert({
      where: { handle: p.handle },
      update: data,
      create: { handle: p.handle, ...data, categories: { connect: data.categories.set } },
    });
    await db.productVariant.deleteMany({ where: { productId: row.id } });
    await db.productVariant.createMany({
      data: p.variants.map((v, j) => ({
        productId: row.id,
        title: v.title,
        sku: v.sku || null,
        priceCents: cents(v.price)!,
        compareCents: cents(v.compareAtPrice),
        available: v.available,
        options: v.options,
        sortOrder: j,
      })),
    });
  }
  console.log(`Producten: ${products.length}`);

  // --- Pagina's ---
  if (fs.existsSync(path.join(__dirname, "..", "content", "pages.json"))) {
    const pages = read<ScrapedPage[]>("pages.json");
    for (const p of pages) {
      const clean = (s: string) => s.replace(/\s*[-–|]\s*Rippotai\s*$/i, "").trim();
      const data = {
        handleEn: p.handleEn !== p.handle ? p.handleEn : null,
        title: { it: clean(p.title.it), en: clean(p.title.en) },
        description: p.description,
        sections: p.sections as Prisma.InputJsonValue,
      };
      await db.page.upsert({ where: { handle: p.handle }, update: data, create: { handle: p.handle, ...data } });
    }
    console.log(`Pagina's: ${pages.length}`);
  }
  // Shopify-policies als pagina met handle "policy-<naam>" (route /[locale]/policies/<naam>)
  if (fs.existsSync(path.join(__dirname, "..", "content", "policies.json"))) {
    const policies = read<{ handle: string; title: L; html: L }[]>("policies.json");
    for (const p of policies) {
      const data = {
        title: p.title,
        description: { it: "", en: "" },
        sections: { it: [{ html: p.html.it, images: [], ctas: [] }], en: [{ html: p.html.en || p.html.it, images: [], ctas: [] }] },
      };
      await db.page.upsert({ where: { handle: `policy-${p.handle}` }, update: data, create: { handle: `policy-${p.handle}`, ...data } });
    }
    console.log(`Policies: ${policies.length}`);
  }

  // --- Reviews ---
  const reviews = read<{ author: string; date: string; rating: number; text: string; product: string }[]>("reviews.json");
  if ((await db.review.count()) === 0) {
    await db.review.createMany({
      data: reviews.map((r, i) => ({
        author: r.author,
        rating: r.rating,
        text: r.text,
        date: new Date(r.date),
        productName: r.product || null,
        featured: r.rating >= 4 && i < 8,
      })),
    });
  }
  console.log(`Reviews: ${reviews.length}`);

  // --- Betaalmethoden ---
  const payments = read<{ key: string; name: string; svg: string }[]>("payment-methods.json");
  for (const [i, p] of payments.entries()) {
    await db.paymentMethod.upsert({ where: { key: p.key }, update: { name: p.name, svg: p.svg }, create: { ...p, sortOrder: i } });
  }
  console.log(`Betaalmethoden: ${payments.length}`);

  // --- Instellingen (alleen aanmaken als ze nog niet bestaan) ---
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value: value as Prisma.InputJsonValue } });
  }
  console.log("Instellingen: klaar");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
