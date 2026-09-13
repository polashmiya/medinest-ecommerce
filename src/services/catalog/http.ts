import "server-only";
import type { CatalogService, ProductQuery } from "@/types";
import { queryToParams } from "@/lib/listing-params";

/**
 * HTTP catalog provider. Point CATALOG_API_URL at a backend that implements the
 * endpoints below and the storefront switches over without UI changes. Every
 * response must match the types in `src/types` (the mock provider is the
 * reference implementation).
 *
 *   GET /products?{listing params}        → ProductListResult
 *   GET /products/:id                     → ProductDetail
 *   GET /products/slug/:slug              → ProductDetail
 *   GET /products/by-ids?ids=1,2          → ProductSummary[]
 *   GET /products/:id/related?limit=      → ProductSummary[]
 *   GET /products/:id/alternatives?limit= → ProductSummary[]
 *   GET /products/index?limit=&sort=      → { id, slug, updatedAt }[]
 *   GET /categories                       → Category[]
 *   GET /categories/tree                  → CategoryNode[]
 *   GET /categories/:idOrSlug             → Category
 *   GET /categories/:id/trail             → Category[]
 *   GET /brands?featured=&limit=          → Brand[]
 *   GET /brands/:idOrSlug                 → Brand
 *   GET /generics/:id                     → GenericInfo
 *   GET /products/:id/reviews?page=       → Paginated<Review>
 *   GET /search/suggest?q=&limit=         → SearchSuggestion[]
 */
const BASE = process.env.CATALOG_API_URL?.replace(/\/$/, "") ?? "";
const REVALIDATE = Number(process.env.CATALOG_REVALIDATE_SECONDS ?? 300);

async function get<T>(path: string, fallback: T, tags: string[] = ["catalog"]): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { accept: "application/json" },
    next: { revalidate: REVALIDATE, tags },
  });
  if (res.status === 404) return fallback;
  if (!res.ok) throw new Error(`Catalog API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

function listingQuery(q: ProductQuery) {
  const p = queryToParams(q);
  if (q.categoryId != null) p.set("categoryId", String(q.categoryId));
  if (q.categorySlug) p.set("category", q.categorySlug);
  if (q.brandSlug) p.set("brandSlug", q.brandSlug);
  if (q.flash) p.set("flash", "1");
  if (q.trending) p.set("trending", "1");
  if (q.ids?.length) p.set("ids", q.ids.join(","));
  if (q.excludeIds?.length) p.set("exclude", q.excludeIds.join(","));
  if (q.page) p.set("page", String(q.page));
  if (q.perPage) p.set("perPage", String(q.perPage));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const httpCatalog: CatalogService = {
  listProducts: (q) =>
    get(`/products${listingQuery(q)}`, { items: [], total: 0, page: 1, perPage: q.perPage ?? 24, totalPages: 1, facets: { brands: [], types: [], forms: [], price: { min: 0, max: 0 } } }),
  getProduct: (id) => get(`/products/${id}`, null, ["catalog", `product-${id}`]),
  getProductBySlug: (slug) => get(`/products/slug/${encodeURIComponent(slug)}`, null, ["catalog", `product-${slug}`]),
  getProductsByIds: (ids) => (ids.length ? get(`/products/by-ids${qs({ ids: ids.join(",") })}`, []) : Promise.resolve([])),
  getRelatedProducts: (id, limit) => get(`/products/${id}/related${qs({ limit })}`, []),
  getAlternatives: (id, limit) => get(`/products/${id}/alternatives${qs({ limit })}`, []),
  getProductIndex: (opts = {}) => get(`/products/index${qs({ limit: opts.limit, sort: opts.sort })}`, []),
  getCategories: () => get("/categories", []),
  getCategoryTree: () => get("/categories/tree", []),
  getCategory: (idOrSlug) => get(`/categories/${encodeURIComponent(String(idOrSlug))}`, null),
  getCategoryTrail: (id) => get(`/categories/${id}/trail`, []),
  getBrands: (opts = {}) => get(`/brands${qs({ featured: opts.featured, limit: opts.limit, withLogo: opts.withLogo })}`, []),
  getBrand: (idOrSlug) => get(`/brands/${encodeURIComponent(String(idOrSlug))}`, null),
  getGeneric: (id) => get(`/generics/${id}`, null),
  getReviews: (id, opts = {}) => get(`/products/${id}/reviews${qs({ page: opts.page, perPage: opts.perPage })}`, { items: [], total: 0, page: 1, perPage: 10, totalPages: 1 }),
  suggest: (q, limit) => get(`/search/suggest${qs({ q, limit })}`, []),
};
