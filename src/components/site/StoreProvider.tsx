"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Currency } from "@/lib/settings-defaults";
import type { Lang } from "@/lib/i18n";

export type CartItem = {
  productId: string;
  variantId: string;
  href: string;
  title: string;
  variantTitle: string | null;
  priceCents: number;
  image: string | null;
  qty: number;
};

type Store = {
  lang: Lang;
  ready: boolean;
  currency: Currency;
  currencies: Currency[];
  setCurrency: (code: string) => void;
  country: string;
  setCountry: (code: string) => void;
  items: CartItem[];
  count: number;
  subtotalCents: number;
  add: (item: CartItem) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  /** Bedrag in eurocent omrekenen en opmaken in de gekozen valuta */
  money: (cents: number) => string;
};

const Ctx = createContext<Store | null>(null);
const CART_KEY = "rp_cart_v1";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function formatMoney(cents: number, currency: Currency, lang: Lang) {
  const amount = (cents / 100) * currency.rate;
  return new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-GB", { style: "currency", currency: currency.code }).format(amount);
}

export function StoreProvider({
  children,
  lang,
  currencies,
  initialCurrency,
  initialCountry,
}: {
  children: React.ReactNode;
  lang: Lang;
  currencies: Currency[];
  initialCurrency: string;
  initialCountry: string;
}) {
  const [currencyCode, setCurrencyCode] = useState(initialCurrency);
  const [country, setCountryState] = useState(initialCountry);
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const currency = currencies.find((c) => c.code === currencyCode) ?? currencies[0];

  const setCurrency = useCallback((code: string) => {
    setCurrencyCode(code);
    setCookie("rp_currency", code);
  }, []);
  const setCountry = useCallback((code: string) => {
    setCountryState(code);
    setCookie("rp_country", code);
  }, []);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const found = prev.find((x) => x.variantId === item.variantId);
      if (found) return prev.map((x) => (x.variantId === item.variantId ? { ...x, qty: Math.min(99, x.qty + item.qty) } : x));
      return [...prev, item];
    });
    setCartOpen(true);
  }, []);
  const setQty = useCallback((variantId: string, qty: number) => {
    setItems((prev) => (qty <= 0 ? prev.filter((x) => x.variantId !== variantId) : prev.map((x) => (x.variantId === variantId ? { ...x, qty: Math.min(99, qty) } : x))));
  }, []);
  const remove = useCallback((variantId: string) => setItems((prev) => prev.filter((x) => x.variantId !== variantId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Store>(
    () => ({
      lang,
      ready: loaded,
      currency,
      currencies,
      setCurrency,
      country,
      setCountry,
      items,
      count: items.reduce((s, x) => s + x.qty, 0),
      subtotalCents: items.reduce((s, x) => s + x.qty * x.priceCents, 0),
      add,
      setQty,
      remove,
      clear,
      cartOpen,
      setCartOpen,
      money: (cents: number) => formatMoney(cents, currency, lang),
    }),
    [lang, loaded, currency, currencies, setCurrency, country, setCountry, items, add, setQty, remove, clear, cartOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore buiten StoreProvider");
  return ctx;
}

/** Prijs in de gekozen valuta; in EUR exact, anders indicatief (~). */
export function Price({ cents, compareCents, className = "" }: { cents: number; compareCents?: number | null; className?: string }) {
  const { money, currency } = useStore();
  const approx = currency.code !== "EUR" ? "≈ " : "";
  return (
    <span className={className}>
      {compareCents && compareCents > cents ? <s className="mr-2 opacity-50">{money(compareCents)}</s> : null}
      {approx}
      {money(cents)}
    </span>
  );
}
