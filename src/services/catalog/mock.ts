import "server-only";
import fs from "node:fs";
import path from "node:path";
import { catalogConfig, type SortId } from "@/config/catalog.config";
import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { generateReviews } from "@/data/mock/reviews";
import { routes } from "@/lib/routes";
import type {
  Brand, CatalogService, Category, CategoryNode, FacetValue, Paginated, Product, ProductDetail,
  ProductListResult, ProductQuery, ProductSummary, Review, SearchSuggestion,
} from "@/types";
import { buildGenericInfo } from "./generics";
import { normalize, scoreDoc, tokenize, type SearchDoc } from "./search";
import { toSummary } from "./summary";

/**
 * Mock catalog provider backed by the JSON files in `src/data/generated`.
 * Files are read at runtime (not imported) so the multi-megabyte product list
 * never enters the TypeScript program or a client bundle.
 */

const DATA_DIR = path.join(process.cwd(), "src", "data", "generated");
const readJson = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T;

interface Store {
  products: Product[];
  byId: Map<number, Product>;
  bySlug: Map<string, Product>;
  summaries: Map<number, ProductSummary>;
  docs: Map<number, SearchDoc>;
  categories: Category[];
  catById: Map<number, Category>;
  catBySlug: Map<string, Category>;
  children: Map<number | null, Category[]>;
  /** Category id → ids of products in it or any descendant */
  catProducts: Map<number, Set<number>>;
  brands: Brand[];
  brandById: Map<number, Brand>;
  brandBySlug: Map<string, Brand>;
  generics: Map<string, { id: number | null; name: string; count: number }>;
}

let store: Store | null = null;

function popularity(p: Product) {
  return p.stats.ordered * 3 + p.stats.viewed / 40 + p.stats.wishlisted * 2;
}

function load(): Store {
  if (store) return store;
  const products = readJson<Product[]>("products.json");
  const categories = readJson<Category[]>("categories.json");
  const brands = readJson<Brand[]>("brands.json");

  const catById = new Map(categories.map((c) => [c.id, c]));
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));
  const children = new Map<number | null, Category[]>();
  for (const c of categories) {
    const list = children.get(c.parentId) ?? [];
    list.push(c);
    children.set(c.parentId, list);
  }
  const rootOrder = navigationConfig.categoryOrder as readonly string[];
  const rank = (c: Category) => {
    const i = rootOrder.indexOf(c.slug);
    return i === -1 ? rootOrder.length : i;
  };
  for (const [parent, list] of children) {
    list.sort((a, b) => (parent === null ? rank(a) - rank(b) : 0) || b.productCount - a.productCount || a.name.localeCompare(b.name));
  }

  const catProducts = new Map<number, Set<number>>();
  const docs = new Map<number, SearchDoc>();
  const summaries = new Map<number, ProductSummary>();
  const generics = new Map<string, { id: number | null; name: string; count: number }>();
  for (const p of products) {
    summaries.set(p.id, toSummary(p));
    for (const cid of p.categoryPath) {
      let set = catProducts.get(cid);
      if (!set) catProducts.set(cid, (set = new Set()));
      set.add(p.id);
    }
    docs.set(p.id, {
      name: `${p.name} ${p.strength}`,
      genericName: p.genericName,
      brandName: p.brandName,
      categoryName: catById.get(p.categoryId)?.name ?? "",
      tags: p.tags,
    });
    if (p.genericName) {
      const key = normalize(p.genericName);
      const g = generics.get(key);
      if (g) g.count++;
      else generics.set(key, { id: p.genericId, name: p.genericName, count: 1 });
    }
  }

  store = {
    products: [...products].sort((a, b) => popularity(b) - popularity(a)),
    byId: new Map(products.map((p) => [p.id, p])),
    bySlug: new Map(products.map((p) => [p.slug, p])),
    summaries,
    docs,
    categories,
    catById,
    catBySlug,
    children,
    catProducts,
    brands: [...brands].sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name)),
    brandById: new Map(brands.map((b) => [b.id, b])),
    brandBySlug: new Map(brands.map((b) => [b.slug, b])),
    generics,
  };
  return store;
}

function sortProducts(list: Product[], sort: SortId, scores?: Map<number, number>) {
  const s = load();
  const price = (p: Product) => s.summaries.get(p.id)!.price;
  const cmp: Record<SortId, (a: Product, b: Product) => number> = {
    popularity: (a, b) => popularity(b) - popularity(a),
    trending: (a, b) => b.trendingScore - a.trendingScore,
    price_asc: (a, b) => price(a) - price(b),
    price_desc: (a, b) => price(b) - price(a),
    discount: (a, b) => s.summaries.get(b.id)!.discountPercent - s.summaries.get(a.id)!.discountPercent || popularity(b) - popularity(a),
    rating: (a, b) => b.rating.average * Math.log1p(b.rating.count) - a.rating.average * Math.log1p(a.rating.count),
    newest: (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    name_asc: (a, b) => a.name.localeCompare(b.name),
  };
  const byScore = scores ? (a: Product, b: Product) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) : null;
  return [...list].sort((a, b) => (byScore ? byScore(a, b) : 0) || cmp[sort](a, b));
}

function facetsFor(list: Product[]) {
  const s = load();
  const brands = new Map<number, FacetValue>();
  const types = new Map<string, FacetValue>();
  const forms = new Map<string, FacetValue>();
  let min = Infinity;
  let max = 0;
  for (const p of list) {
    if (p.brandId != null) {
      const b = brands.get(p.brandId);
      if (b) b.count++;
      else brands.set(p.brandId, { id: p.brandId, label: s.brandById.get(p.brandId)?.name ?? p.brandName, count: 1 });
    }
    const t = types.get(p.type);
    if (t) t.count++;
    else types.set(p.type, { id: p.type, label: typeLabel(p.type), count: 1 });
    if (p.form) {
      const f = forms.get(p.form);
      if (f) f.count++;
      else forms.set(p.form, { id: p.form, label: p.form, count: 1 });
    }
    const price = s.summaries.get(p.id)!.price;
    min = Math.min(min, price);
    max = Math.max(max, price);
  }
  const byCount = (a: FacetValue, b: FacetValue) => b.count - a.count || a.label.localeCompare(b.label);
  return {
    brands: [...brands.values()].sort(byCount).slice(0, 60),
    types: [...types.values()].sort(byCount),
    forms: [...forms.values()].sort(byCount),
    price: { min: Number.isFinite(min) ? Math.floor(min) : 0, max: Math.ceil(max) },
  };
}

/** Human label for a product type, taken from the matching root category. */
function typeLabel(type: string) {
  const root = load().children.get(null)?.find((c) => c.type === type);
  return root?.name ?? type.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function paginate<T>(items: T[], page = 1, perPage: number = catalogConfig.listing.perPage): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  return { items: items.slice((current - 1) * perPage, current * perPage), total: items.length, page: current, perPage, totalPages };
}

/** Original, factual description for non-medicine products (no third-party copy). */
function describe(p: Product, s: Store): string {
  const cat = s.catById.get(p.categoryId)?.name;
  const parts = [
    `<p><strong>${escapeHtml(p.name)}</strong>${p.brandName ? ` by ${escapeHtml(p.brandName)}` : ""}${cat ? ` is part of our ${escapeHtml(cat)} range` : ""}.`,
    ` Every unit is sourced from the manufacturer or an authorised distributor and stored under recommended conditions until it reaches you.</p>`,
    `<h3>Highlights</h3><ul>`,
    p.strength ? `<li>Pack / size: ${escapeHtml(p.strength)}</li>` : "",
    p.form ? `<li>Form: ${escapeHtml(p.form)}</li>` : "",
    p.manufacturer ? `<li>Made by: ${escapeHtml(p.manufacturer)}</li>` : "",
    `<li>Delivered across ${siteConfig.country} with easy returns on damaged or incorrect items</li>`,
    `</ul><h3>How to use</h3><p>Follow the directions on the pack. Keep out of reach of children and store in a cool, dry place away from direct sunlight.</p>`,
  ];
  return parts.join("");
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function toDetail(p: Product, s: Store): ProductDetail {
  const medicine = catalogConfig.medicineTypes.includes(p.type);
  return {
    ...p,
    inStock: p.inStock,
    descriptionHtml: medicine ? undefined : describe(p, s),
    generic: p.genericId != null && p.genericName ? buildGenericInfo(p.genericId, p.genericName) : null,
  };
}

export const mockCatalog: CatalogService = {
  async listProducts(query: ProductQuery): Promise<ProductListResult> {
    const s = load();
    let list = s.products;

    const category = query.categoryId != null ? s.catById.get(query.categoryId) : query.categorySlug ? s.catBySlug.get(query.categorySlug) : undefined;
    if (query.categoryId != null || query.categorySlug) {
      const ids = category ? s.catProducts.get(category.id) : undefined;
      list = ids ? list.filter((p) => ids.has(p.id)) : [];
    }
    if (query.brandSlug) {
      const brand = s.brandBySlug.get(query.brandSlug);
      list = brand ? list.filter((p) => p.brandId === brand.id) : [];
    }
    if (query.ids?.length) {
      const set = new Set(query.ids);
      list = list.filter((p) => set.has(p.id));
    }
    if (query.excludeIds?.length) {
      const set = new Set(query.excludeIds);
      list = list.filter((p) => !set.has(p.id));
    }
    if (query.tag) list = list.filter((p) => p.tags.includes(query.tag!));
    if (query.flash) list = list.filter((p) => p.isFlashSale);
    if (query.trending) list = list.filter((p) => p.isTrending || p.tags.includes("trending") || p.trendingScore > 50);
    if (query.genericId != null) list = list.filter((p) => p.genericId === query.genericId);
    if (query.types?.length) list = list.filter((p) => query.types!.includes(p.type));
    if (query.rx) list = list.filter((p) => (query.rx === "rx" ? p.rxRequired : !p.rxRequired));

    let scores: Map<number, number> | undefined;
    if (query.search) {
      const tokens = tokenize(query.search);
      scores = new Map();
      for (const p of list) {
        const score = scoreDoc(s.docs.get(p.id)!, query.search, tokens);
        if (score > 0) scores.set(p.id, score + Math.log1p(popularity(p)) / 4);
      }
      list = list.filter((p) => scores!.has(p.id));
    }

    // Facets describe the result set before the user's refinements are applied.
    const facets = facetsFor(list);

    if (query.brandIds?.length) list = list.filter((p) => p.brandId != null && query.brandIds!.includes(p.brandId));
    if (query.forms?.length) list = list.filter((p) => query.forms!.includes(p.form));
    if (query.priceMin !== undefined) list = list.filter((p) => s.summaries.get(p.id)!.price >= query.priceMin!);
    if (query.priceMax !== undefined) list = list.filter((p) => s.summaries.get(p.id)!.price <= query.priceMax!);
    if (query.discountMin) list = list.filter((p) => s.summaries.get(p.id)!.discountPercent >= query.discountMin!);
    if (query.ratingMin) list = list.filter((p) => p.rating.count > 0 && p.rating.average >= query.ratingMin!);
    if (query.inStock) list = list.filter((p) => s.summaries.get(p.id)!.inStock);

    const sort = query.sort ?? (query.search ? undefined : catalogConfig.listing.defaultSort);
    const sorted = sort ? sortProducts(list, sort) : sortProducts(list, catalogConfig.listing.defaultSort, scores);
    const page = paginate(sorted, query.page, query.perPage);
    return { ...page, items: page.items.map((p) => s.summaries.get(p.id)!), facets };
  },

  async getProduct(id) {
    const s = load();
    const p = s.byId.get(id);
    return p ? toDetail(p, s) : null;
  },

  async getProductBySlug(slug) {
    const s = load();
    const p = s.bySlug.get(slug);
    return p ? toDetail(p, s) : null;
  },

  async getProductsByIds(ids) {
    const s = load();
    return ids.map((id) => s.summaries.get(id)).filter((x): x is ProductSummary => Boolean(x));
  },

  async getRelatedProducts(productId, limit = catalogConfig.listing.relatedSize) {
    const s = load();
    const p = s.byId.get(productId);
    if (!p) return [];
    const out: ProductSummary[] = [];
    const seen = new Set([productId]);
    const push = (ids: Set<number> | undefined) => {
      if (!ids) return;
      for (const candidate of s.products) {
        if (out.length >= limit) return;
        if (ids.has(candidate.id) && !seen.has(candidate.id) && candidate.genericId !== p.genericId) {
          seen.add(candidate.id);
          out.push(s.summaries.get(candidate.id)!);
        }
      }
    };
    // Walk up the category path: siblings first, then the wider department.
    for (const cid of [...p.categoryPath].reverse()) push(s.catProducts.get(cid));
    return out;
  },

  async getAlternatives(productId, limit = catalogConfig.listing.relatedSize) {
    const s = load();
    const p = s.byId.get(productId);
    if (!p || p.genericId == null) return [];
    return s.products
      .filter((x) => x.id !== p.id && x.genericId === p.genericId && x.form === p.form)
      .sort((a, b) => Number(b.strength === p.strength) - Number(a.strength === p.strength) || s.summaries.get(a.id)!.price - s.summaries.get(b.id)!.price)
      .slice(0, limit)
      .map((x) => s.summaries.get(x.id)!);
  },

  async getProductIndex(opts = {}) {
    const s = load();
    const list = opts.sort ? sortProducts(s.products, opts.sort) : s.products;
    return list.slice(0, opts.limit ?? list.length).map((p) => ({ id: p.id, slug: p.slug, updatedAt: p.createdAt }));
  },

  async getCategories() {
    return load().categories;
  },

  async getCategoryTree() {
    const s = load();
    const build = (parent: number | null): CategoryNode[] =>
      (s.children.get(parent) ?? []).map((c) => ({ ...c, children: build(c.id) }));
    return build(null);
  },

  async getCategory(idOrSlug) {
    const s = load();
    return (typeof idOrSlug === "number" ? s.catById.get(idOrSlug) : s.catBySlug.get(idOrSlug)) ?? null;
  },

  async getCategoryTrail(id) {
    const s = load();
    const c = s.catById.get(id);
    return c ? c.path.map((cid) => s.catById.get(cid)).filter((x): x is Category => Boolean(x)) : [];
  },

  async getBrands(opts = {}) {
    let list = load().brands.filter((b) => b.productCount > 0);
    if (opts.featured) list = list.filter((b) => b.isFeatured);
    if (opts.withLogo) list = list.filter((b) => b.logo);
    return opts.limit ? list.slice(0, opts.limit) : list;
  },

  async getBrand(idOrSlug) {
    const s = load();
    return (typeof idOrSlug === "number" ? s.brandById.get(idOrSlug) : s.brandBySlug.get(idOrSlug)) ?? null;
  },

  async getGeneric(id) {
    const p = load().products.find((x) => x.genericId === id);
    return p ? buildGenericInfo(id, p.genericName) : null;
  },

  async getReviews(productId, opts = {}): Promise<Paginated<Review>> {
    const p = load().byId.get(productId);
    if (!p) return paginate<Review>([], 1, opts.perPage ?? 10);
    const all = generateReviews(p.id, p.variants[0]?.id ?? p.id, p.rating.average, p.rating.count, 30);
    return paginate(all, opts.page ?? 1, opts.perPage ?? 10);
  },

  async suggest(q, limit = catalogConfig.search.suggestionLimit) {
    const s = load();
    const query = q.trim();
    if (query.length < catalogConfig.search.minChars) return [];
    const tokens = tokenize(query);
    const nq = normalize(query);

    const hits: { p: Product; score: number }[] = [];
    for (const p of s.products) {
      const score = scoreDoc(s.docs.get(p.id)!, query, tokens);
      if (score > 0) hits.push({ p, score: score + Math.log1p(popularity(p)) / 4 });
    }
    hits.sort((a, b) => b.score - a.score);

    const out: SearchSuggestion[] = hits.slice(0, limit).map(({ p }) => {
      const sum = s.summaries.get(p.id)!;
      return {
        type: "product",
        id: p.id,
        label: [p.name, p.strength].filter(Boolean).join(" "),
        sublabel: [p.form, p.genericName || p.brandName].filter(Boolean).join(" · "),
        href: routes.product(p.slug),
        image: p.images[0] ?? null,
        price: sum.price,
        mrp: sum.mrp,
        art: { id: p.id, name: p.name, strength: p.strength, form: p.form, type: p.type, brandName: p.brandName },
      };
    });

    const generic = [...s.generics.values()]
      .filter((g) => normalize(g.name).startsWith(nq))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map<SearchSuggestion>((g) => ({ type: "generic", id: g.name, label: g.name, sublabel: `${g.count} brands`, href: routes.search(g.name) }));
    const cats = s.categories
      .filter((c) => normalize(c.name).includes(nq) && c.productCount > 0)
      .slice(0, 3)
      .map<SearchSuggestion>((c) => ({ type: "category", id: c.id, label: c.name, sublabel: `${c.productCount} products`, href: routes.category(c.slug) }));
    const brands = s.brands
      .filter((b) => b.productCount > 0 && normalize(b.name).startsWith(nq))
      .slice(0, 3)
      .map<SearchSuggestion>((b) => ({ type: "brand", id: b.id, label: b.name, sublabel: `${b.productCount} products`, href: routes.brand(b.slug) }));

    return [...generic, ...cats, ...brands, ...out];
  },
};
