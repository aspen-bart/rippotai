# Rippotai: nieuwe webshop

Nieuw design voor [rippotai.it](https://www.rippotai.it/) (Shopify) als Next.js-webshop met eigen database en
beheerpaneel. Eco-stijl, gericht op particulieren én hospitality (hotels, restaurants, events).
Italiaans en Engels; extra talen kunnen later worden toegevoegd. Afrekenen in euro, andere valuta worden indicatief getoond.

**Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS 4, Prisma (SQLite lokaal, PostgreSQL in productie),
zod, jose (JWT-sessie beheer), bcryptjs.

## Snel starten (lokaal)

```bash
npm install
cp .env.example .env        # vul AUTH_SECRET en ADMIN_PASSWORD in
npm run setup               # maakt de SQLite-database aan en importeert content/*.json
npm run dev                 # http://localhost:3100  (beheer: /admin)
```

De gescrapete content staat al in `content/` en `public/images/`. Opnieuw scrapen: `npm run scrape`
(of `node scripts/scrape.mjs shop|pages|policies|reviews|home|footer`), daarna `npm run db:seed`.

## URL-structuur (gelijk aan de oude site)

| Oud (Shopify)                         | Nieuw                                   |
| ------------------------------------- | --------------------------------------- |
| `/it-it`, `/en-it`                    | idem (homepage per taal)                |
| `/it-it/collections/<handle>`         | idem                                    |
| `/it-it/products/<handle>`            | idem; Engels gebruikt de Engelse handle (`/en-it/products/<handleEn>`), de andere wordt doorgestuurd |
| `/it-it/pages/<handle>`               | idem                                    |
| `/it-it/policies/<handle>`            | idem (voorwaarden, verzending, retour, privacy) |
| `/collections/...` zonder taal        | 301 naar `/it-it/...` (middleware)      |
| `/it-it/cart`                         | doorgestuurd naar `/it-it/checkout` (winkelwagen is een zijpaneel) |

## Wat er in staat

- **Content:** 12 categorieën (Cartoleria ecologica met 7 subcategorieën, Hotel & Ristoranti, Gadget green,
  Allestimenti, Quadri motivazionali), 39 producten met varianten en afbeeldingen, 32 pagina's + 4 policies (IT/EN),
  Loox-reviews en de 15 betaalmethode-logo's uit de oude footer.
- **Shop:** winkelwagen (zijpaneel, localStorage), checkout die een bestelling in de database zet (prijzen altijd
  uit de database), land-, taal- en valutakeuze (talen DE/FR/ES/NL staan als "presto" in de lijst).
- **Beheer (`/admin`):** dashboard, categorieën, producten, pagina's, reviews, bestellingen, berichten en nieuwsbrief,
  WhatsApp-knop, betaalmethoden, instellingen (aankondigingsbalk, verzendkosten, bedrijfsgegevens, valuta en koersen).

## Mappen

```
content/            Gescrapete content (JSON) — bron voor prisma/seed.ts
prisma/             schema.prisma + seed.ts
public/images/      Lokaal opgeslagen afbeeldingen van rippotai.it
scripts/scrape.mjs  Scraper (Shopify JSON-endpoints + HTML, cache in scripts/raw/)
src/app/[locale]/   Publieke site (home, collections, products, pages, policies, checkout, search)
src/app/admin/      Beheerpaneel
src/components/site Header, footer, winkelwagen, productkaart, WhatsApp-knop, ...
src/lib/            db, i18n + woordenboeken, catalogus-queries, menu, instellingen, server actions
```

## Database: SQLite lokaal, PostgreSQL op Netlify

Er is één schema (`prisma/schema.prisma`). Draai Prisma altijd via de npm-scripts of `npm run prisma -- <commando>`:
`scripts/prisma.mjs` kijkt naar `DATABASE_URL`. Bij een `postgresql://`-URL genereert het
`prisma/schema.postgres.prisma` (provider `postgresql`, plus `directUrl` als `DIRECT_URL` gezet is) en gebruikt dat.
Anders gewoon SQLite. Codewijzigingen zijn daarvoor niet nodig; de client bevat ook de engine voor Netlify
(`binaryTargets`).

## Live zetten op Netlify

1. **PostgreSQL-database aanmaken**, bv. via Netlify DB of [Neon](https://neon.tech). Bij Neon: de *pooled* URL is
   `DATABASE_URL`, de *direct* URL is `DIRECT_URL`.
2. **Schema en content in die database zetten** (eenmalig, vanaf je eigen machine):
   ```bash
   DATABASE_URL="postgresql://..." DIRECT_URL="postgresql://..." ADMIN_PASSWORD="..." npm run setup
   ```
   Daarna lokaal weer `npm run prisma -- generate` (zonder die variabelen) om de SQLite-client terug te zetten.
3. **Netlify-site koppelen** aan GitHub-repo `aspen-bart/rippotai`. `netlify.toml` regelt de build
   (`npm run build`) en de Next.js-plugin.
4. **Omgevingsvariabelen in Netlify:** `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (min. 32 tekens) en
   `NEXT_PUBLIC_SITE_URL` (de live URL).
5. **Na een schemawijziging:** stap 2 opnieuw met alleen `npm run db:push`.

Nog te regelen:
- **Uploads uit het beheer** komen in `public/uploads/`. Op Netlify blijft dat niet bewaard; koppel daarvoor
  Netlify Blobs of S3 (`src/lib/admin/upload.ts`).
- **Betalen:** de checkout registreert bestellingen zonder betaling (demo). Koppel een provider
  (Mollie/Stripe) in `src/lib/actions/site.ts` → `placeOrder`.
