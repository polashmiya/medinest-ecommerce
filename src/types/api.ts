import type { SortId } from "@/config/catalog.config";
import type { Brand, Category, CategoryNode, GenericInfo, Product, ProductDetail, ProductSummary, Review } from "./catalog";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ProductQuery {
  page?: number;
  perPage?: number;
  sort?: SortId;
  search?: string;
  categoryId?: number;
  categorySlug?: string;
  brandIds?: number[];
  brandSlug?: string;
  types?: string[];
  forms?: string[];
  priceMin?: number;
  priceMax?: number;
  discountMin?: number;
  ratingMin?: number;
  inStock?: boolean;
  rx?: "rx" | "otc";
  tag?: string;
  flash?: boolean;
  trending?: boolean;
  genericId?: number;
  ids?: number[];
  excludeIds?: number[];
}

export interface FacetValue {
  id: string | number;
  label: string;
  count: number;
}

export interface ProductFacets {
  brands: FacetValue[];
  types: FacetValue[];
  forms: FacetValue[];
  price: { min: number; max: number };
}

export interface ProductListResult extends Paginated<ProductSummary> {
  facets: ProductFacets;
}

export interface SearchSuggestion {
  type: "product" | "category" | "brand" | "generic" | "query";
  id: string | number;
  label: string;
  sublabel?: string;
  href: string;
  image?: string | null;
  price?: number;
  mrp?: number;
  /** Inputs for the generated thumbnail when there is no photo. */
  art?: { id: number; name: string; strength?: string; form?: string; type?: string; brandName?: string };
}

/**
 * Contract every data provider must satisfy. The mock provider reads local JSON;
 * a future HTTP provider can call a real backend with the same signatures.
 */
export interface CatalogService {
  listProducts(query: ProductQuery): Promise<ProductListResult>;
  getProduct(id: number): Promise<ProductDetail | null>;
  getProductBySlug(slug: string): Promise<ProductDetail | null>;
  getProductsByIds(ids: number[]): Promise<ProductSummary[]>;
  getRelatedProducts(productId: number, limit?: number): Promise<ProductSummary[]>;
  getAlternatives(productId: number, limit?: number): Promise<ProductSummary[]>;
  /** Lightweight list of every product URL, for sitemaps and static params. */
  getProductIndex(opts?: { limit?: number; sort?: SortId }): Promise<{ id: number; slug: string; updatedAt: string | null }[]>;
  getCategories(): Promise<Category[]>;
  getCategoryTree(): Promise<CategoryNode[]>;
  getCategory(idOrSlug: number | string): Promise<Category | null>;
  /** Root → category chain, for breadcrumbs. */
  getCategoryTrail(id: number): Promise<Category[]>;
  getBrands(opts?: { featured?: boolean; limit?: number; withLogo?: boolean }): Promise<Brand[]>;
  getBrand(idOrSlug: number | string): Promise<Brand | null>;
  getGeneric(id: number): Promise<GenericInfo | null>;
  getReviews(productId: number, opts?: { page?: number; perPage?: number }): Promise<Paginated<Review>>;
  suggest(q: string, limit?: number): Promise<SearchSuggestion[]>;
}

export type { Product, ProductSummary, ProductDetail, Category, CategoryNode, Brand, Review };
