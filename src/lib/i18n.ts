// Talen en URL-prefixen. De prefixen volgen de oude Shopify-site (/it-it, /en-it) zodat bestaande URL's blijven werken.
// Een nieuwe taal toevoegen: prefix hier + woordenboek in dictionaries.ts + vertalingen in de database.

export const LANGS = ["it", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const LOCALE_PREFIX: Record<Lang, string> = { it: "it-it", en: "en-it" };
export const PREFIX_TO_LANG: Record<string, Lang> = { "it-it": "it", "en-it": "en" };
export const DEFAULT_LANG: Lang = "it";

/** Talen die al in de keuzelijst staan maar nog niet live zijn. */
export const UPCOMING_LANGS = [
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "nl", label: "Nederlands" },
];

export const LANG_LABEL: Record<Lang, string> = { it: "Italiano", en: "English" };

export function langFromPrefix(prefix: string): Lang | null {
  return PREFIX_TO_LANG[prefix] ?? null;
}

/** Vertaalbaar JSON-veld uitlezen met terugval op Italiaans. */
export type Localized = Partial<Record<string, string>>;
export function t(value: unknown, lang: Lang): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const v = value as Localized;
  return v[lang] || v[DEFAULT_LANG] || "";
}

export function localePath(lang: Lang, path = "") {
  return `/${LOCALE_PREFIX[lang]}${path}`;
}
