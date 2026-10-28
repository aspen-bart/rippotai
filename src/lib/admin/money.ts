// Bedragen in het beheer: invoer in euro's (komma of punt), opslag in eurocent.

/** "12,50" | "12.5" | "1.234,56" | "1,234.56" | "€ 9" → cent. null = leeg, NaN = ongeldig. */
export function parseEuro(input: string | null | undefined): number | null {
  const s = String(input ?? "")
    .replace(/[€\s]/g, "")
    .trim();
  if (!s) return null;
  let norm = s;
  const comma = s.lastIndexOf(",");
  const dot = s.lastIndexOf(".");
  if (comma > -1 && dot > -1) {
    norm = comma > dot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (comma > -1) {
    norm = s.replace(",", ".");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(norm)) return NaN;
  return Math.round(Number(norm) * 100);
}

/** Cent → invoerwaarde "12,50" (leeg bij null). */
export function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

const fmt = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
export function formatEuro(cents: number | null | undefined): string {
  return cents == null ? "–" : fmt.format(cents / 100);
}
