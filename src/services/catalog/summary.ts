import type { Product, ProductSummary, ProductVariant } from "@/types";

/** The variant shown by default on cards: the base variant, else the first one. */
export function defaultVariant(p: Pick<Product, "variants">): ProductVariant {
  return p.variants.find((v) => v.isBase) ?? p.variants[0];
}

/** Project a full product onto the lightweight shape used by cards, rails and the cart. */
export function toSummary(p: Product): ProductSummary {
  const v = defaultVariant(p);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type,
    form: p.form,
    strength: p.strength,
    rxRequired: p.rxRequired,
    brandId: p.brandId,
    brandName: p.brandName,
    genericName: p.genericName,
    categoryId: p.categoryId,
    rootCategoryId: p.rootCategoryId,
    images: p.images,
    rating: p.rating,
    isFlashSale: p.isFlashSale,
    isTrending: p.isTrending,
    inStock: p.inStock && v.inStock,
    coldChain: p.coldChain,
    dhakaOnly: p.dhakaOnly,
    createdAt: p.createdAt,
    price: v.price,
    mrp: v.mrp,
    discountPercent: v.discountPercent,
    salesUnit: v.salesUnit,
    unitMultiplier: v.unitMultiplier,
    baseUnit: v.baseUnit,
    variantId: v.id,
    variantCount: p.variants.length,
    maxQty: v.maxQty,
  };
}

/** "Strip (10 Tablets)" style label for the sales unit. */
export function unitLabel(s: Pick<ProductSummary, "salesUnit" | "unitMultiplier" | "baseUnit">) {
  if (!s.salesUnit) return "";
  if (s.unitMultiplier > 1 && s.baseUnit && s.baseUnit !== s.salesUnit) {
    return `${s.salesUnit} (${s.unitMultiplier} ${s.baseUnit}${s.unitMultiplier > 1 ? "s" : ""})`;
  }
  return s.salesUnit;
}
