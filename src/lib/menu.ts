import "server-only";
import { db } from "./db";
import { t, localePath, type Lang } from "./i18n";
import { getDict } from "./dictionaries";

// Hoofdmenu, opgebouwd zoals op rippotai.it. Links naar categorieën/pagina's die niet (meer) in de
// database staan of niet gepubliceerd zijn, worden automatisch weggelaten.

type L = { it: string; en: string };
type Ref = { collection: string; label?: L } | { page: string; label?: L };
type Column = { title: L; ref?: Ref; items: Ref[] };

export type MenuLink = { label: string; href: string; image?: string | null; description?: string };
export type MenuColumn = { title: string; href?: string; image?: string | null; items: MenuLink[] };
export type MenuItem = { label: string; href?: string; columns?: MenuColumn[]; feature?: MenuLink };

const COMPANY: Column[] = [
  {
    title: { it: "Hotel & Ristoranti", en: "Hotels & Restaurants" },
    ref: { collection: "soluzioni-sostenibili-per-hotel-e-hospitality" },
    items: [
      { page: "wellness-experience-hotel", label: { it: "Wellness experience per hotel", en: "Wellness experience for hotels" } },
      { page: "incrementa-i-clienti-del-tuo-ristorante", label: { it: "Più clienti al tuo ristorante", en: "More guests for your restaurant" } },
      { collection: "sottopiatti-e-tovagliette-in-carta" },
    ],
  },
  {
    title: { it: "Eventi e Gadget", en: "Events and Gadgets" },
    items: [
      { collection: "green-gadgets" },
      { collection: "allestimenti-allestimenti-ecosostenibili-su-misura" },
      { page: "eventi-sostenibili-e-allestimenti-per-fiere", label: { it: "Eventi e fiere sostenibili", en: "Sustainable events and fairs" } },
      { page: "esperienza-multisensoriale-eventi-installazioni", label: { it: "Installazioni multisensoriali", en: "Multisensory installations" } },
    ],
  },
  {
    title: { it: "Comunicazione sostenibile", en: "Sustainable communication" },
    items: [
      { page: "soluzioni-personalizzate-per-aziende", label: { it: "Soluzioni personalizzate", en: "Custom solutions" } },
      { collection: "quadri-motivazionali" },
      { page: "business", label: { it: "Rippotai per il business", en: "Rippotai for business" } },
      { page: "scarica-tutti-i-cataloghi-rippotai", label: { it: "Scarica i cataloghi", en: "Download catalogues" } },
    ],
  },
];

const PRIVATE: Column[] = [
  {
    title: { it: "Cartoleria ecologica", en: "Eco-friendly stationery" },
    ref: { collection: "cartoleria-ecologica-e-piantabile" },
    items: [
      { collection: "carta-piantabile-personalizzata" },
      { collection: "biglietti-auguri-con-semi" },
      { collection: "matita-piantabile" },
      { collection: "quaderni-e-notebook" },
      { collection: "bombe-di-semi" },
      { collection: "sottopiatti-e-tovagliette-in-carta" },
      { collection: "ventagli-di-carta" },
    ],
  },
  {
    title: { it: "Scopri di più", en: "Learn more" },
    items: [
      { page: "carta-piantabile-fatta-in-carcere", label: { it: "altreMANI: carta dal carcere", en: "altreMANI: paper from prison" } },
      { page: "come-piantare-i-nostri-green-gadget", label: { it: "Pianta i nostri green gadget", en: "Plant our green gadgets" } },
      { page: "matite-piantabili", label: { it: "Le matite piantabili", en: "Plantable pencils" } },
      { page: "faq-domande-frequenti", label: { it: "Domande frequenti", en: "FAQ" } },
    ],
  },
];

const SOUND: Ref[] = [
  { page: "musicoterapia-strumenti-sonori-soundpotai", label: { it: "Musicoterapia a casa", en: "Music therapy at home" } },
  { page: "diffusore-audio-multisensoriale-soundpotai", label: { it: "Il diffusore multisensoriale", en: "The multisensory speaker" } },
  { page: "esperienza-immersiva-aziendale", label: { it: "Eventi e teambuilding", en: "Events and team building" } },
  { page: "sala-immersiva-sonora-musei", label: { it: "Musei e mostre", en: "Museums and exhibitions" } },
  { page: "wellness-experience-hotel", label: { it: "Hospitality e wellness", en: "Hospitality and wellness" } },
];

const ABOUT: Ref[] = [
  { page: "chi-siamo", label: { it: "Chi siamo", en: "About us" } },
  { page: "sostenibilita", label: { it: "Valori e Mission", en: "Values and Mission" } },
  { page: "relazioni-dimpatto", label: { it: "Report di sostenibilità", en: "Sustainability Report" } },
  { page: "il-codice-etico", label: { it: "Il Codice Etico", en: "The Code of Ethics" } },
];

export async function buildMenu(lang: Lang): Promise<MenuItem[]> {
  const [cats, pages] = await Promise.all([
    db.category.findMany({ where: { published: true }, select: { handle: true, title: true, image: true, tagline: true } }),
    db.page.findMany({ where: { published: true }, select: { handle: true, handleEn: true, title: true } }),
  ]);
  const catMap = new Map(cats.map((c) => [c.handle, c]));
  const pageMap = new Map(pages.map((p) => [p.handle, p]));
  const d = getDict(lang);

  const link = (ref: Ref): MenuLink | null => {
    if ("collection" in ref) {
      const c = catMap.get(ref.collection);
      if (!c) return null;
      return { label: ref.label ? ref.label[lang] : t(c.title, lang), href: localePath(lang, `/collections/${c.handle}`), image: c.image, description: t(c.tagline, lang) };
    }
    const p = pageMap.get(ref.page);
    if (!p) return null;
    const handle = lang === "en" && p.handleEn ? p.handleEn : p.handle;
    return { label: ref.label ? ref.label[lang] : t(p.title, lang), href: localePath(lang, `/pages/${handle}`) };
  };
  const columns = (cols: Column[]): MenuColumn[] =>
    cols.map((col) => {
      const head = col.ref ? link(col.ref) : null;
      return { title: col.title[lang], href: head?.href, image: head?.image, items: col.items.map(link).filter((x): x is MenuLink => !!x) };
    });

  const hospitality = catMap.get("soluzioni-sostenibili-per-hotel-e-hospitality");
  const stationery = catMap.get("cartoleria-ecologica-e-piantabile");
  const contact = link({ page: "contatti" });

  return [
    {
      label: d.nav.companyShop,
      columns: columns(COMPANY),
      feature: hospitality ? { label: t(hospitality.title, lang), description: t(hospitality.tagline, lang), href: localePath(lang, `/collections/${hospitality.handle}`), image: hospitality.image } : undefined,
    },
    {
      label: d.nav.privateShop,
      columns: columns(PRIVATE),
      feature: stationery ? { label: t(stationery.title, lang), description: t(stationery.tagline, lang), href: localePath(lang, `/collections/${stationery.handle}`), image: stationery.image } : undefined,
    },
    { label: d.nav.soundpotai, columns: [{ title: "Soundpotai", items: SOUND.map(link).filter((x): x is MenuLink => !!x) }] },
    { label: d.nav.contacts, href: contact?.href ?? localePath(lang, "/pages/contatti") },
    { label: d.nav.whoWeAre, columns: [{ title: d.nav.whoWeAre, items: ABOUT.map(link).filter((x): x is MenuLink => !!x) }] },
  ];
}
