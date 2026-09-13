import { catalogConfig, type SortId } from "@/config/catalog.config";
import type { ProductQuery } from "@/types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v.join(",") : v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const num = (v: string | undefined) => {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * URL search params ⇄ ProductQuery. Keeps listing URLs short and shareable:
 * ?page=2&sort=price_asc&brand=12,34&type=medicine&form=Tablet&price=500-1000&discount=20&rating=4&stock=1&rx=otc
 */
export function parseListingParams(sp: RawSearchParams): ProductQuery {
  const sortRaw = first(sp.sort) as SortId | undefined;
  const sort = catalogConfig.sortOptions.some((o) => o.id === sortRaw) ? sortRaw : undefined;
  const perPageRaw = num(first(sp.perPage));
  const perPage = perPageRaw && catalogConfig.listing.perPageOptions.includes(perPageRaw) ? perPageRaw : catalogConfig.listing.perPage;
  const [pmin, pmax] = (first(sp.price) ?? "").split("-");
  const rx = first(sp.rx);
  return {
    page: Math.max(1, num(first(sp.page)) ?? 1),
    perPage,
    sort,
    search: first(sp.q)?.trim() || undefined,
    brandIds: list(sp.brand).map(Number).filter(Number.isFinite),
    types: list(sp.type),
    forms: list(sp.form),
    priceMin: num(pmin),
    priceMax: num(pmax),
    discountMin: num(first(sp.discount)),
    ratingMin: num(first(sp.rating)),
    inStock: first(sp.stock) === "1" ? true : undefined,
    rx: rx === "rx" || rx === "otc" ? rx : undefined,
    tag: first(sp.tag) || undefined,
    genericId: num(first(sp.genericId)),
  };
}

export function queryToParams(q: ProductQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (q.search) p.set("q", q.search);
  if (q.page && q.page > 1) p.set("page", String(q.page));
  if (q.perPage && q.perPage !== catalogConfig.listing.perPage) p.set("perPage", String(q.perPage));
  if (q.sort && q.sort !== catalogConfig.listing.defaultSort) p.set("sort", q.sort);
  if (q.brandIds?.length) p.set("brand", q.brandIds.join(","));
  if (q.types?.length) p.set("type", q.types.join(","));
  if (q.forms?.length) p.set("form", q.forms.join(","));
  if (q.priceMin !== undefined || q.priceMax !== undefined) p.set("price", `${q.priceMin ?? ""}-${q.priceMax ?? ""}`);
  if (q.discountMin) p.set("discount", String(q.discountMin));
  if (q.ratingMin) p.set("rating", String(q.ratingMin));
  if (q.inStock) p.set("stock", "1");
  if (q.rx) p.set("rx", q.rx);
  if (q.tag) p.set("tag", q.tag);
  if (q.genericId) p.set("genericId", String(q.genericId));
  return p;
}

/**
 * URL for a listing with some query fields changed. Any change other than the
 * page itself resets pagination. `undefined` in the patch removes a field.
 */
export function listingHref(basePath: string, q: ProductQuery, patch: Partial<ProductQuery> = {}) {
  const resetsPage = Object.keys(patch).some((k) => k !== "page");
  const next: ProductQuery = { ...q, ...patch, ...(resetsPage && !("page" in patch) ? { page: 1 } : {}) };
  const qs = queryToParams(next).toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Number of user-applied filters (excludes paging/sorting/search). */
export function activeFilterCount(q: ProductQuery) {
  return (
    (q.brandIds?.length ?? 0) + (q.types?.length ?? 0) + (q.forms?.length ?? 0) +
    (q.priceMin !== undefined || q.priceMax !== undefined ? 1 : 0) + (q.discountMin ? 1 : 0) +
    (q.ratingMin ? 1 : 0) + (q.inStock ? 1 : 0) + (q.rx ? 1 : 0)
  );
}
