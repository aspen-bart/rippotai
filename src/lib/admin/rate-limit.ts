import "server-only";

// Eenvoudige rate-limit in het geheugen (per serverinstantie). Voldoende voor het inlogscherm;
// op serverless (Netlify) is dit per functie-instantie en dus slechts een drempel, geen garantie.
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.count++;
  return b.count <= max;
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export function clientIp(h: Headers): string {
  return h.get("x-nf-client-connection-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}
