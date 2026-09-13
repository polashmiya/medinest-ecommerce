# MediNest

An online pharmacy and healthcare storefront built with Next.js 16, React 19, TypeScript and Tailwind CSS v4. It covers the full shopping journey (browse, search, product details, cart, checkout, orders) and is configuration-driven, so branding, catalog rules, delivery zones and feature flags live in one place.

The store runs entirely on bundled demo data and browser storage, and every data access goes through a service layer that can be pointed at a real backend without touching the UI.

## Features

- **Catalog**: 2,400+ products across 12 departments and ~700 categories, brand pages, generic-name search, alternative brands, related products.
- **Search**: typeahead with products, generics, categories and brands; recent and trending searches.
- **Listings**: filters (brand, form, price, discount, rating, prescription, stock), sorting, crawlable pagination, grid/list view.
- **Product pages**: pack-size pricing, medicine overview and safety notes, specifications, reviews, FAQ, structured data and generated share images.
- **Cart & checkout**: coupons, delivery zones with fees and ETAs, cold-chain rules, prescription upload for Rx items, cash on delivery and (simulated) mobile wallet / card payments.
- **Account**: OTP login (demo), orders with tracking, cancel and reorder, addresses, wishlist, prescriptions, notifications.
- **Services**: prescription upload, lab tests, doctor consultation, blog, info pages, pharmacy registration.
- **Display settings** (saved per device): light / dark / system mode, 6 colour presets (Teal Coral by default), 5 fonts, text size, corner radius, density, card size and style, cart width, page width, sticky header, language (English / Bengali), reduced motion.
- **Mobile**: app-style bottom tab bar, auto-hiding header, back button, bottom sheets, pinned cart/checkout/buy bars, installable (web app manifest).
- **SEO**: server-rendered pages, canonical URLs, sitemap, robots.txt, JSON-LD (organization, products, breadcrumbs, FAQs, articles), Open Graph images.

## Getting started

Requires **Node.js 20.9 or newer**.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Generate route types and run the TypeScript compiler |

## Configuration

Everything brand- or business-specific is in `src/config/`:

| File | Controls |
| --- | --- |
| `site.config.ts` | Name, contact details, legal info, social links, value propositions |
| `theme.config.ts` | Colour presets, fonts, radii, densities, page widths, surfaces |
| `settings.config.ts` | Default display settings and their options |
| `commerce.config.ts` | Currency, delivery zones and fees, payment methods, coupons, cart limits |
| `catalog.config.ts` | Listing sizes, sort options, filters, product card options, search |
| `navigation.config.ts` | Top bar, header tabs, account menu, mobile tab bar, footer |
| `home.config.ts` | Homepage sections, hero slides, quick actions, FAQs |
| `labels.config.ts` | All UI copy (English and Bengali) |
| `features.config.ts` | Feature flags (also overridable with `NEXT_PUBLIC_FEATURE_*`) |
| `seo.config.ts` | Title templates, robots rules, sitemap settings |

Environment variables are optional and documented in [`.env.example`](.env.example). Copy it to `.env.local` to use them.

## Data and backend

- **Catalog**: `src/services/catalog` exposes one `CatalogService` interface. The mock provider reads `src/data/generated/*.json`. Set `CATALOG_API_URL` to switch to the HTTP provider; the expected endpoints are listed in `src/services/catalog/http.ts`.
- **Content** (blog, info pages, lab tests, doctors): `src/services/content`, same pattern, switchable with `CONTENT_API_URL`.
- **Customer data** (cart, orders, addresses, auth, prescriptions): client stores in `src/stores`, persisted to `localStorage`. Replace the store actions with API calls when a backend is available.
- **Product images**: products without photos get an original illustration generated from their form and brand (`src/components/product/product-art.ts`, served at `/art/product/<id>`). Set `NEXT_PUBLIC_IMAGE_BASE_URL` and populate each product's `images` to use real photos.

## Project structure

```
src/
  app/          Routes (App Router), metadata routes, API routes
  components/   UI primitives, layout, product, listing, cart, checkout, account, content
  config/       All configuration (see above)
  data/         Demo catalog (generated JSON) and mock content
  lib/          Formatting, i18n, routing, SEO, cart maths, theme helpers
  services/     Catalog and content providers (mock + HTTP)
  stores/       Zustand stores persisted to localStorage
  types/        Shared TypeScript types
```

## Deployment

Any Node.js host works (`npm run build && npm start`). On Vercel, import the repository with the Next.js preset and set `NEXT_PUBLIC_SITE_URL` to the production URL.

## Demo limitations

- Login codes are shown on screen, payments are simulated, and orders, bookings and prescriptions are stored only in the visitor's browser.
- The bundled catalog is demo data. Replace it with your own licensed product catalog, images and descriptions before going live, and have medicine information reviewed by a pharmacist.
