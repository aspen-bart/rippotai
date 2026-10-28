// Standaardwaarden voor de instellingen die in /admin beheerd worden (tabel Setting, één JSON-waarde per sleutel).
// Wordt gebruikt door de seed en als terugval wanneer een sleutel (nog) niet in de database staat.

export type WhatsAppSettings = {
  enabled: boolean;
  /** internationaal formaat zonder + of spaties, bv. 390541448618 */
  phone: string;
  label: { it: string; en: string };
  message: { it: string; en: string };
  position: "right" | "left";
  showOnMobile: boolean;
};

export type Currency = { code: string; name: { it: string; en: string }; symbol: string; rate: number; flag: string };

export type CurrencySettings = {
  /** valuta waarin werkelijk wordt afgerekend */
  base: "EUR";
  currencies: Currency[];
};

export type StoreSettings = {
  announcement: { it: string; en: string };
  freeShippingFromCents: number;
  shippingCents: number;
  company: {
    name: string;
    legal: string;
    vat: string;
    phone: string;
    email: string;
    pec: string;
    headquarters: string;
    registeredOffice: string;
  };
  social: { instagram: string; facebook: string; youtube: string; tiktok: string };
};

export const DEFAULT_SETTINGS: { whatsapp: WhatsAppSettings; currency: CurrencySettings; store: StoreSettings } = {
  whatsapp: {
    enabled: true,
    phone: "390541448618",
    label: { it: "Scrivici su WhatsApp", en: "Write to us on WhatsApp" },
    message: { it: "Ciao Rippotai! Vorrei avere informazioni.", en: "Hi Rippotai! I'd like some information." },
    position: "right",
    showOnMobile: true,
  },
  currency: {
    base: "EUR",
    currencies: [
      { code: "EUR", name: { it: "Euro", en: "Euro" }, symbol: "€", rate: 1, flag: "eu" },
      { code: "AUD", name: { it: "Dollaro australiano", en: "Australian Dollar" }, symbol: "A$", rate: 1.68, flag: "au" },
      { code: "CHF", name: { it: "Franco svizzero", en: "Swiss Franc" }, symbol: "CHF", rate: 0.94, flag: "ch" },
      { code: "GBP", name: { it: "Sterlina britannica", en: "British Pound Sterling" }, symbol: "£", rate: 0.86, flag: "gb" },
      { code: "CAD", name: { it: "Dollaro canadese", en: "Canadian Dollar" }, symbol: "C$", rate: 1.55, flag: "ca" },
      { code: "USD", name: { it: "Dollaro statunitense", en: "United States Dollar" }, symbol: "$", rate: 1.12, flag: "us" },
    ],
  },
  store: {
    announcement: { it: "Entra nel mondo Rippotai: spedizione gratuita", en: "Step into the Rippotai world: free shipping" },
    freeShippingFromCents: 0,
    shippingCents: 0,
    company: {
      name: "Rippotai Srl",
      legal: "Società Benefit",
      vat: "IT04476820404",
      phone: "0541 448618",
      email: "info@rippotai.it",
      pec: "rippotai@legalmail.it",
      headquarters: "Via S. Allende 202-204, 47841 Cattolica (RN)",
      registeredOffice: "Via Meleto 853, 47835 Saludecio (RN)",
    },
    social: {
      instagram: "https://www.instagram.com/rippotai/",
      facebook: "https://www.facebook.com/rippotai",
      youtube: "https://www.youtube.com/@rippotai",
      tiktok: "https://www.tiktok.com/@rippotai",
    },
  },
};

export type SettingKey = keyof typeof DEFAULT_SETTINGS;
export type SettingValue<K extends SettingKey> = (typeof DEFAULT_SETTINGS)[K];
