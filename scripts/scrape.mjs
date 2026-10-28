// Haalt categorieën, producten, pagina's, reviews en betaalmethoden op van rippotai.it
// en schrijft ze naar content/*.json + public/images. Ruwe responses worden gecachet in scripts/raw/.
// Gebruik: node scripts/scrape.mjs   (verwijder scripts/raw/ om opnieuw te downloaden)
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";

const BASE = "https://www.rippotai.it";
const LOCALES = { it: "it-it", en: "en-it" };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = path.join(ROOT, "scripts", "raw");
const CONTENT = path.join(ROOT, "content");
const PUBLIC = path.join(ROOT, "public");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36";

// Categorieboom. `take` = aantal producten dat we uit deze collectie overnemen.
const CATEGORIES = [
  { handle: "cartoleria-ecologica-e-piantabile", group: "private", take: 0 },
  { handle: "carta-piantabile-personalizzata", parent: "cartoleria-ecologica-e-piantabile", group: "private", take: 5 },
  { handle: "biglietti-auguri-con-semi", parent: "cartoleria-ecologica-e-piantabile", group: "private", take: 4 },
  { handle: "matita-piantabile", parent: "cartoleria-ecologica-e-piantabile", group: "private", take: 4 },
  { handle: "quaderni-e-notebook", parent: "cartoleria-ecologica-e-piantabile", group: "private", take: 4 },
  { handle: "bombe-di-semi", parent: "cartoleria-ecologica-e-piantabile", group: "private", take: 4 },
  { handle: "sottopiatti-e-tovagliette-in-carta", parent: "cartoleria-ecologica-e-piantabile", group: "private", take: 4 },
  { handle: "ventagli-di-carta", parent: "cartoleria-ecologica-e-piantabile", group: "private", take: 4 },
  { handle: "soluzioni-sostenibili-per-hotel-e-hospitality", group: "company", take: 0 },
  { handle: "green-gadgets", group: "company", take: 4 },
  { handle: "allestimenti-allestimenti-ecosostenibili-su-misura", group: "company", take: 3 },
  { handle: "quadri-motivazionali", group: "company", take: 3 },
];
// Hotel & hospitality heeft op de bronsite geen eigen producten: we vullen hem met passende items.
const HOSPITALITY_FROM = ["sottopiatti-e-tovagliette-in-carta", "matita-piantabile", "carta-piantabile-personalizzata", "bombe-di-semi", "ventagli-di-carta", "green-gadgets"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, { cache = true } = {}) {
  const key = crypto.createHash("md5").update(url).digest("hex");
  const file = path.join(RAW, key);
  if (cache) {
    try {
      const cached = JSON.parse(await fs.readFile(file, "utf8"));
      return cached;
    } catch {}
  }
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "it,en" }, redirect: "follow" });
    if (res.status === 429 || res.status >= 500) {
      await sleep(2000 * attempt);
      continue;
    }
    const out = { status: res.status, url: res.url, body: res.ok ? await res.text() : "" };
    await fs.writeFile(file, JSON.stringify(out));
    await sleep(250);
    return out;
  }
  throw new Error(`Mislukt: ${url}`);
}

async function fetchJson(url) {
  const r = await fetchText(url);
  if (r.status !== 200) return null;
  try {
    return JSON.parse(r.body);
  } catch {
    return null;
  }
}

const downloaded = new Map();
async function downloadImage(src, destDir, baseName, width = 1400) {
  if (!src) return null;
  let url = src.startsWith("//") ? "https:" + src : src;
  if (url.startsWith("/")) url = BASE + url;
  const u = new URL(url);
  if (u.hostname.endsWith("rippotai.it") || u.hostname.includes("shopify")) {
    u.searchParams.delete("width");
    u.searchParams.delete("height");
    u.searchParams.set("width", String(width));
  }
  const key = u.toString();
  if (downloaded.has(key)) return downloaded.get(key);
  let ext = path.extname(u.pathname).toLowerCase() || ".jpg";
  if (![".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"].includes(ext)) ext = ".jpg";
  const rel = `/images/${destDir}/${baseName}${ext}`;
  const abs = path.join(PUBLIC, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  try {
    await fs.access(abs);
  } catch {
    const res = await fetch(key, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.warn("  ! afbeelding mislukt", res.status, key);
      downloaded.set(key, null);
      return null;
    }
    await fs.writeFile(abs, Buffer.from(await res.arrayBuffer()));
    await sleep(80);
  }
  downloaded.set(key, rel);
  return rel;
}

const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

// Interne links naar de nieuwe site herschrijven; locale-loze Shopify-links krijgen de juiste prefix.
function rewriteHref(href, locale) {
  if (!href) return href;
  let h = href.trim();
  if (h.startsWith("//www.rippotai.it")) h = "https:" + h;
  if (/^https?:\/\/(www\.)?rippotai\.it/.test(h)) h = h.replace(/^https?:\/\/(www\.)?rippotai\.it/, "") || "/";
  if (h.startsWith("/")) {
    if (!/^\/(it-it|en-it)(\/|$)/.test(h) && /^\/(collections|products|pages|blogs|cart|search|account)/.test(h)) {
      h = `/${LOCALES[locale]}${h}`;
    }
    h = h.replace(/^\/[a-z]{2}-[a-z]{2,4}(?=\/|$)/, (m) => (m === "/en-it" || m === "/it-it" ? m : `/${LOCALES[locale]}`));
  }
  return h;
}

const SANITIZE = {
  allowedTags: ["h1", "h2", "h3", "h4", "h5", "p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "u", "a", "blockquote", "table", "thead", "tbody", "tr", "td", "th", "span", "img", "figure", "figcaption", "hr"],
  allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "width", "height"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: { b: "strong", i: "em", h1: "h2" },
  exclusiveFilter: (frame) => ["span", "p", "li", "strong", "em"].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren?.length,
};

function cleanHtml(html, locale) {
  if (!html) return "";
  const $ = cheerio.load(`<div id="__r">${html}</div>`, null, false);
  $("a").each((_, a) => $(a).attr("href", rewriteHref($(a).attr("href"), locale)));
  let out = sanitizeHtml($("#__r").html() || "", SANITIZE);
  out = out.replace(/<span>(.*?)<\/span>/gs, "$1").replace(/(<br \/>\s*){3,}/g, "<br /><br />").replace(/\n{2,}/g, "\n").trim();
  return out;
}

async function localizeImagesInHtml(html, dir, prefix) {
  const $ = cheerio.load(`<div id="__r">${html}</div>`, null, false);
  let i = 0;
  for (const el of $("img").toArray()) {
    const src = $(el).attr("src");
    const local = await downloadImage(src, dir, `${prefix}-inline-${++i}`, 1200);
    if (local) $(el).attr("src", local).attr("loading", "lazy");
    else $(el).remove();
  }
  return $("#__r").html() || "";
}

// ---------- Collecties & producten ----------
async function scrapeShop() {
  const collections = [];
  const lists = {}; // handle -> { it: [...], en: [...] }
  for (const cat of CATEGORIES) {
    const meta = {};
    for (const [lang, loc] of Object.entries(LOCALES)) {
      meta[lang] = (await fetchJson(`${BASE}/${loc}/collections/${cat.handle}.json`))?.collection ?? null;
      lists[cat.handle] ??= {};
      lists[cat.handle][lang] = (await fetchJson(`${BASE}/${loc}/collections/${cat.handle}/products.json?limit=250`))?.products ?? [];
    }
    console.log(`collectie ${cat.handle}: ${lists[cat.handle].it.length} producten`);
    const img = meta.it?.image?.src ? await downloadImage(meta.it.image.src, "collections", cat.handle, 1800) : null;
    collections.push({
      handle: cat.handle,
      parent: cat.parent ?? null,
      group: cat.group,
      image: img,
      title: { it: meta.it?.title ?? cat.handle, en: meta.en?.title ?? meta.it?.title ?? cat.handle },
      description: { it: cleanHtml(meta.it?.description, "it"), en: cleanHtml(meta.en?.description, "en") },
    });
  }

  // Productselectie
  const chosen = new Map(); // id -> product(it)
  for (const cat of CATEGORIES) {
    let n = 0;
    for (const p of lists[cat.handle].it) {
      if (n >= cat.take) break;
      if (chosen.has(p.id) || !p.images?.length) continue;
      chosen.set(p.id, p);
      n++;
    }
  }
  const enById = new Map();
  for (const l of Object.values(lists)) for (const p of l.en) enById.set(p.id, p);

  const products = [];
  for (const p of chosen.values()) {
    const en = enById.get(p.id);
    const cats = CATEGORIES.filter((c) => lists[c.handle].it.some((x) => x.id === p.id)).map((c) => c.handle);
    const images = [];
    for (const [i, im] of p.images.slice(0, 6).entries()) {
      const local = await downloadImage(im.src, "products", `${p.handle.slice(0, 60)}-${i + 1}`, 1400);
      if (local) images.push({ src: local, alt: im.alt || p.title });
    }
    products.push({
      shopifyId: p.id,
      handle: p.handle,
      handleEn: en?.handle ?? p.handle,
      title: { it: p.title, en: en?.title ?? p.title },
      body: { it: cleanHtml(p.body_html, "it"), en: cleanHtml(en?.body_html ?? p.body_html, "en") },
      vendor: p.vendor,
      productType: p.product_type,
      tags: p.tags,
      options: p.options.map((o, i) => ({ name: { it: o.name, en: en?.options?.[i]?.name ?? o.name }, values: o.values })),
      variants: p.variants.map((v) => ({
        title: v.title,
        sku: v.sku,
        price: Number(v.price),
        compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : null,
        available: v.available,
        options: [v.option1, v.option2, v.option3].filter(Boolean),
      })),
      images,
      categories: cats,
    });
    console.log(`  product ${p.handle} (${images.length} img)`);
  }
  // Hospitality vullen
  for (const h of HOSPITALITY_FROM) {
    products.filter((p) => p.categories.includes(h)).slice(0, 2).forEach((p) => p.categories.push("soluzioni-sostenibili-per-hotel-e-hospitality"));
  }
  return { collections, products };
}

// ---------- Pagina's ----------
const SKIP_SECTION = /(newsletter|footer|header|announcement|apps?$|loox|whatsapp|popup)/i;

async function parsePage(html, locale, handle) {
  const $ = cheerio.load(html);
  const pageTitle = ($("meta[property='og:title']").attr("content") || $("title").text()).split("|")[0].trim();
  const description = $("meta[name='description']").attr("content") || "";
  const main = $("main").first();
  const sections = [];
  let idx = 0;
  for (const el of main.find("[id^='shopify-section-']").toArray()) {
    const id = $(el).attr("id");
    if (SKIP_SECTION.test(id)) continue;
    // alleen top-level secties
    if ($(el).parents("[id^='shopify-section-']").length) continue;
    const s = $(el);
    s.find("script,style,noscript,form,svg,button,iframe,input,select,.visually-hidden,.hide").remove();
    idx++;
    const images = [];
    const seen = new Set();
    const addImg = async (src, alt) => {
      if (!src || src.startsWith("data:") || seen.has(src.split("?")[0])) return;
      seen.add(src.split("?")[0]);
      const local = await downloadImage(src, `pages/${handle}`, `s${idx}-${images.length + 1}`, 1600);
      if (local) images.push({ src: local, alt: alt || "" });
    };
    for (const v of s.find("video").toArray()) await addImg($(v).attr("poster"), "");
    for (const im of s.find("img").toArray()) {
      const src = $(im).attr("src") || $(im).attr("data-src") || ($(im).attr("srcset") || "").split(" ")[0];
      if (/logo|icon/i.test(src || "")) continue;
      await addImg(src, $(im).attr("alt"));
    }
    for (const bg of s.find("[style*='background-image']").toArray()) {
      const m = /url\(['"]?([^'")]+)/.exec($(bg).attr("style"));
      if (m) await addImg(m[1], "");
    }
    for (const bg of s.find("[data-bgset],[data-bg]").toArray()) {
      const v = ($(bg).attr("data-bgset") || $(bg).attr("data-bg") || "").split(" ")[0];
      await addImg(v, "");
    }
    s.find("img,video,picture").remove();
    // knoppen/links bewaren als CTA's
    const ctas = [];
    s.find("a.btn, a.button, a[class*='btn']").each((_, a) => {
      const label = $(a).text().replace(/\s+/g, " ").trim();
      if (label) ctas.push({ label, href: rewriteHref($(a).attr("href"), locale) });
      $(a).remove();
    });
    const body = cleanHtml(s.html() || "", locale);
    const text = cheerio.load(body).text().replace(/\s+/g, " ").trim();
    if (!text && !images.length) continue;
    sections.push({ html: body, images, ctas });
  }
  return { title: pageTitle, description, sections };
}

async function scrapePages() {
  const xml = (await fetchText(`${BASE}/it-it/sitemap_pages_1.xml?from=61364732070&to=708965957962`)).body;
  const handles = [...xml.matchAll(/<loc>https:\/\/www\.rippotai\.it\/it-it\/pages\/([^<]+)<\/loc>/g)].map((m) => m[1]);
  const pages = [];
  for (const handle of handles) {
    const it = await fetchText(`${BASE}/it-it/pages/${handle}`);
    const en = await fetchText(`${BASE}/en-it/pages/${handle}`);
    if (it.status !== 200) {
      console.warn("  ! pagina", handle, it.status);
      continue;
    }
    const pIt = await parsePage(it.body, "it", handle);
    const pEn = en.status === 200 ? await parsePage(en.body, "en", handle) : pIt;
    const handleEn = en.status === 200 ? (new URL(en.url).pathname.split("/pages/")[1] || handle) : handle;
    pages.push({ handle, handleEn, title: { it: pIt.title, en: pEn.title }, description: { it: pIt.description, en: pEn.description }, sections: { it: pIt.sections, en: pEn.sections } });
    console.log(`pagina ${handle}: ${pIt.sections.length} secties`);
  }
  return pages;
}

// ---------- Homepage-beelden (voor de nieuwe homepage) ----------
async function scrapeHomeMedia() {
  const home = await fetchText(`${BASE}/it-it`);
  const $ = cheerio.load(home.body);
  const out = [];
  let i = 0;
  for (const el of $("main [id^='shopify-section-']").toArray()) {
    for (const v of $(el).find("video").toArray()) {
      const poster = $(v).attr("poster");
      const local = await downloadImage(poster, "home", `video-${++i}`, 2000);
      if (local) out.push({ src: local, kind: "poster" });
    }
    for (const im of $(el).find("img").toArray()) {
      const src = $(im).attr("src") || ($(im).attr("srcset") || "").split(" ")[0];
      if (!src || /logo|icon/i.test(src)) continue;
      const local = await downloadImage(src, "home", `img-${++i}`, 2000);
      if (local) out.push({ src: local, alt: $(im).attr("alt") || "", kind: "image" });
    }
  }
  const videos = [...home.body.matchAll(/https?:\/\/[^"' ]+\.mp4[^"' ]*/g)].map((m) => m[0]);
  return { images: out, videos: [...new Set(videos)].slice(0, 3) };
}

// ---------- Reviews (Loox) ----------
async function scrapeReviews() {
  const reviews = [];
  for (let page = 1; page <= 5; page++) {
    const r = await fetchText(`https://loox.io/widget/9v_drszmz_/reviews?h=1782998238010&page=${page}`);
    const $ = cheerio.load(r.body);
    const items = $(".grid-item").toArray();
    if (!items.length) break;
    for (const it of items) {
      const label = $(it).find("[aria-label^='Product Review by']").first().attr("aria-label") || $(it).attr("aria-label") || "";
      const m = /Product Review by (.+?), (\d{2}\/\d{2}\/\d{4}), rating (\d)\/5 stars, ([\s\S]*)/.exec(label);
      if (!m) continue;
      const product = $(it).find(".product-name, [class*='product-name'], .item-product-title").first().text().trim();
      const [d, mo, y] = m[2].split("/");
      reviews.push({ author: m[1], date: `${y}-${mo}-${d}`, rating: Number(m[3]), text: m[4].trim(), product });
    }
  }
  const uniq = [...new Map(reviews.map((r) => [r.author + r.date + r.text.slice(0, 20), r])).values()];
  console.log(`reviews: ${uniq.length}`);
  return uniq;
}

// ---------- Betaalmethoden + logo ----------
async function scrapeFooter() {
  const home = await fetchText(`${BASE}/it-it`);
  const $ = cheerio.load(home.body);
  const payments = [];
  $("ul.payment-icons li svg").each((_, svg) => {
    const key = ($(svg).attr("aria-labelledby") || "").replace(/^pi-/, "");
    const name = $(svg).find("title").text().trim() || key;
    $(svg).find("title").remove();
    payments.push({ key, name, svg: $.html(svg) });
  });
  await downloadImage("//www.rippotai.it/cdn/shop/files/logo-rippotai-verde-500.png", "brand", "logo-green", 500);
  await downloadImage("//www.rippotai.it/cdn/shop/files/logo-rippotai-neg-500px.png", "brand", "logo-white", 500);
  console.log(`betaalmethoden: ${payments.map((p) => p.key).join(", ")}`);
  return payments;
}

// ---------- Shopify-policies (voorwaarden, verzending, retour, privacy) ----------
const POLICIES = ["terms-of-service", "shipping-policy", "refund-policy", "privacy-policy"];
async function scrapePolicies() {
  const out = [];
  for (const handle of POLICIES) {
    const entry = { handle, title: {}, html: {} };
    for (const [lang, loc] of Object.entries(LOCALES)) {
      const r = await fetchText(`${BASE}/${loc}/policies/${handle}`);
      if (r.status !== 200) continue;
      const $ = cheerio.load(r.body);
      entry.title[lang] = $(".shopify-policy__title h1").text().trim() || $("title").text().split("|")[0].trim();
      entry.html[lang] = cleanHtml($(".shopify-policy__body").html() || "", lang);
    }
    if (entry.html.it) out.push(entry);
    console.log(`policy ${handle}: ${entry.html.it?.length ?? 0} tekens`);
  }
  return out;
}

async function main() {
  await fs.mkdir(RAW, { recursive: true });
  await fs.mkdir(CONTENT, { recursive: true });
  const write = (name, data) => fs.writeFile(path.join(CONTENT, name), JSON.stringify(data, null, 2));
  const only = process.argv[2];
  if (!only || only === "footer") await write("payment-methods.json", await scrapeFooter());
  if (!only || only === "shop") {
    const { collections, products } = await scrapeShop();
    await write("collections.json", collections);
    await write("products.json", products);
  }
  if (!only || only === "home") await write("home-media.json", await scrapeHomeMedia());
  if (!only || only === "reviews") await write("reviews.json", await scrapeReviews());
  if (!only || only === "pages") await write("pages.json", await scrapePages());
  if (!only || only === "policies") await write("policies.json", await scrapePolicies());
  console.log("Klaar.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
