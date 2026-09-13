import "server-only";
import { cache } from "react";
import type { CatalogService } from "@/types";
import { httpCatalog } from "./http";
import { mockCatalog } from "./mock";

/**
 * The single entry point pages use for catalog data. Set CATALOG_API_URL to
 * switch from the local mock data to a real backend; nothing else changes.
 */
const provider: CatalogService = process.env.CATALOG_API_URL ? httpCatalog : mockCatalog;

/** Per-request memoisation so generateMetadata and the page share one lookup. */
export const catalog: CatalogService = {
  listProducts: cache(provider.listProducts),
  getProduct: cache(provider.getProduct),
  getProductBySlug: cache(provider.getProductBySlug),
  getProductsByIds: provider.getProductsByIds,
  getRelatedProducts: cache(provider.getRelatedProducts),
  getAlternatives: cache(provider.getAlternatives),
  getProductIndex: provider.getProductIndex,
  getCategories: cache(provider.getCategories),
  getCategoryTree: cache(provider.getCategoryTree),
  getCategory: cache(provider.getCategory),
  getCategoryTrail: cache(provider.getCategoryTrail),
  getBrands: provider.getBrands,
  getBrand: cache(provider.getBrand),
  getGeneric: cache(provider.getGeneric),
  getReviews: provider.getReviews,
  suggest: provider.suggest,
};

export { toSummary, defaultVariant, unitLabel } from "./summary";
export { personalizeGeneric } from "./generics";
