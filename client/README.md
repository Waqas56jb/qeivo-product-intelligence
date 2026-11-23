# Qeivo — Client (Phase 1)

Premium front end for **Qeivo**, a Product Intelligence Platform. *Know Before You Buy.*

This is a front-end-only demonstration. It has no backend, API routes, database, real
authentication or external data integrations. Everything runs on local, deterministic TypeScript seed data.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
npx tsc --noEmit
npx tsx scripts/validate-data.ts     # checks seed-data relationships and minimum counts
node scripts/generate-renders.mjs    # regenerates studio product renders from catalog specs
```

Requires Node 20+. The render generator needs Node 22.6+ because it relies on built-in TypeScript type stripping.

## What's inside

- **Public website**: home, about, how it works, pricing, buying guides, categories and a video library.
- **Auth and onboarding**: static demo flows with a role switcher for customer, manufacturer, supplier, creator and developer views.
- **Customer app (`/app`)**:
  - Dashboard, catalog, product detail and AI analysis.
  - Suitability score explanation, comparison of 2–4 products, recommendations and Ask Qeivo.
  - Reviews, ownership cost, compatibility checks, saved research, owned products and price intelligence.
  - Community, documents, data history, notifications, profile, settings, privacy and billing.
  - Team workspace and barcode scan.
- **Business portals (`/business`)**: manufacturer, supplier and creator.
- **Developer area (`/developer`)**: API keys, usage and docs.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the folder map, the design token system and the trust rules.

## Trust and evidence rules

1. The **suitability score** (0–10) and **evidence coverage** (%) are separate metrics. They are never combined.
2. Every claim is labelled as one of: measured fact, expert assessment, customer opinion, manufacturer claim or AI interpretation.
3. Every claim links to local source metadata, such as a manual page, spec sheet section, lab table or video timestamp.
4. Sponsored content and affiliate links are always disclosed. They never affect scores, verdicts, rankings or recommendations.
5. Missing, conflicting, stale and unverified data are shown explicitly. Unknown compatibility is never treated as "fits".

## Data and images

- **Products**: 69 in total.
  - 42 refrigerators across 9 invented brands.
  - 9 washing machines, 9 televisions and 9 laptops.
- **Supporting content**: 275 reviews, 38 videos, 25 buying guides, 19 DIY guides and 30 community questions.
- **Other datasets**: users, companies, workspaces, API usage, invoices, notifications, documents and revisions.
- **Invented names**: all brands, retailers and people are invented. A demo-data notice appears throughout the app.
- **Photography**: lifestyle, kitchen, people and editorial images are free-to-use Unsplash photos. Each one was checked by eye and is listed in `src/data/images.ts`.
- **Product images**: there is no real photography of invented brands, so each product's main image is a consistent studio-style SVG render (`public/images/products`). These are generated from the product's real type, finish and dimensions. Swap in real photography by replacing the first entry of `product.images`.
- **Logo**: the logo is a placeholder geometric mark plus wordmark (`src/components/brand/logo.tsx`, `public/logo`), designed so the final artwork can be substituted in one place.
