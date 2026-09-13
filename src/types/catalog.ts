/** Core catalog entities. These mirror what a backend API would return. */

export type ProductType =
  | "medicine" | "healthcare" | "beauty" | "sexual_wellness" | "supplement" | "herbal" | "homeopathy"
  | "ayurvedic" | "food" | "pet" | "veterinary" | "baby" | "homecare" | "uncategorized" | string;

export interface ProductVariant {
  id: number;
  sku: string;
  /** e.g. { "pack size": "220ml", "color": "Red" } */
  attributes: Record<string, string>;
  /** Price of the sales unit (e.g. per strip) before discount */
  mrp: number;
  /** Discounted price of the sales unit */
  price: number;
  discountPercent: number;
  minQty: number;
  maxQty: number;
  inStock: boolean;
  /** Smallest unit label, e.g. "Tablet" */
  baseUnit: string;
  /** Unit sold, e.g. "Strip" */
  salesUnit: string;
  /** Number of base units per sales unit, e.g. 10 tablets per strip */
  unitMultiplier: number;
  /** Discounted price per base unit (null when same as price) */
  unitPrice: number | null;
  ratingAverage: number;
  ratingCount: number;
  isBase: boolean;
}

export interface ProductUnit {
  id: number;
  label: string;
  multiplier: number;
  isBase: boolean;
  isDefault: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  nameBn: string;
  type: ProductType;
  form: string;
  strength: string;
  rxRequired: boolean;
  genericId: number | null;
  genericName: string;
  brandId: number | null;
  brandName: string;
  manufacturer: string;
  categoryId: number;
  /** Root → leaf category ids */
  categoryPath: number[];
  rootCategoryId: number;
  shortDescription: string;
  metaDescription: string;
  /** Local (or CDN-relative) image paths */
  images: string[];
  variants: ProductVariant[];
  units: ProductUnit[];
  rating: { average: number; count: number };
  stats: { viewed: number; ordered: number; wishlisted: number };
  tags: string[];
  isFlashSale: boolean;
  isTrending: boolean;
  coldChain: boolean;
  dhakaOnly: boolean;
  inStock: boolean;
  trendingScore: number;
  createdAt: string | null;
}

/** Lightweight projection used on cards, rails and search results. */
export type ProductSummary = Pick<
  Product,
  | "id" | "slug" | "name" | "type" | "form" | "strength" | "rxRequired" | "brandId" | "brandName" | "genericName"
  | "categoryId" | "rootCategoryId" | "images" | "rating" | "isFlashSale" | "isTrending" | "inStock" | "coldChain" | "dhakaOnly" | "createdAt"
> & {
  price: number;
  mrp: number;
  discountPercent: number;
  salesUnit: string;
  unitMultiplier: number;
  baseUnit: string;
  variantId: number;
  variantCount: number;
  maxQty: number;
};

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  /** Root → self ids */
  path: number[];
  depth: number;
  weight: number;
  icon: string | null;
  banner: string | null;
  metaTitle: string;
  metaDescription: string;
  description: string;
  productCount: number;
  /** Product type this department maps to (root categories only). */
  type?: string;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  isFeatured: boolean;
  productCount: number;
  description: string;
}

export interface GenericSection {
  title: string;
  content: string | { list?: string[]; tag?: string } | string[];
}

export interface SafetyAdvice {
  type: string;
  tag: string;
  content: string;
}

export interface GenericInfo {
  id: number;
  name: string;
  overview: GenericSection[];
  briefDescription: { title: string; content: string }[];
  quickTips: string[];
  safetyAdvices: SafetyAdvice[];
}

export interface Review {
  id: number | string;
  productId: number;
  variantId: number;
  rating: number;
  text: string;
  userName: string;
  createdAt: string;
  verified?: boolean;
}

export interface ProductDetail extends Product {
  /** Rich HTML description for non-medicine products */
  descriptionHtml?: string;
  generic?: GenericInfo | null;
}
