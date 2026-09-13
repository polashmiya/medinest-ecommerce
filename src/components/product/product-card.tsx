import Link from "next/link";
import { catalogConfig } from "@/config/catalog.config";
import { deliveryConfig } from "@/config/commerce.config";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { unitLabel } from "@/services/catalog/summary";
import type { ProductSummary } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Price, RatingInline } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { AddToCartCompact, WishlistButton } from "./cart-actions";
import { ProductImage } from "./product-image";

const card = catalogConfig.card;
const badges = catalogConfig.badges;

function isNew(createdAt: string | null) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < badges.newDays * 86_400_000;
}

/**
 * Product tile used by grids, rails and search. Server-rendered; only the
 * cart / wishlist controls hydrate. Presentation toggles live in catalogConfig.card.
 */
export function ProductCard({ product, priority, className }: { product: ProductSummary; priority?: boolean; className?: string }) {
  const href = routes.product(product.slug);
  const unit = card.showUnitLabel ? unitLabel(product) : "";
  return (
    <article className={cn("product-card group relative flex flex-col overflow-hidden rounded-xl bg-surface", className)}>
      <div className="product-card-media relative">
        <Link href={href} className="block aspect-[var(--card-aspect,1/1)] overflow-hidden bg-muted" tabIndex={-1} aria-hidden>
          <ProductImage product={product} priority={priority} className="transition-transform duration-300 group-hover:scale-[1.04]" />
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {card.showDiscountBadge && product.discountPercent > 0 ? <Badge tone="discount">{product.discountPercent}% off</Badge> : null}
          {card.showRxBadge && product.rxRequired ? <Badge tone="rx" title="Prescription required">{badges.rxLabel}</Badge> : null}
          {!product.inStock ? <Badge tone="neutral">{badges.outOfStockLabel}</Badge> : null}
          {product.coldChain ? (
            <Badge tone="info">
              <Icon name="snowflake" className="size-3" />
              {badges.coldChainLabel}
            </Badge>
          ) : isNew(product.createdAt) ? (
            <Badge tone="success">New</Badge>
          ) : null}
        </div>
        {card.showWishlist ? <WishlistButton product={product} className="absolute right-2 top-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 aria-pressed:opacity-100" /> : null}
      </div>

      <div className="product-card-body flex flex-1 flex-col gap-1 p-3">
        {card.showBrand && product.brandName ? <p className="truncate text-[0.6875rem] font-medium uppercase tracking-wide text-fg-subtle">{product.brandName}</p> : null}
        <h3 className="text-sm font-semibold leading-snug text-fg">
          <Link href={href} className="line-clamp-2 hover:text-primary-600 dark:hover:text-primary-300" style={{ WebkitLineClamp: card.nameLines }}>
            {product.name}
            {card.showStrength && product.strength ? <span className="font-normal text-fg-muted"> {product.strength}</span> : null}
          </Link>
        </h3>
        {unit || product.form ? <p className="truncate text-xs text-fg-subtle">{[product.form, unit].filter(Boolean).join(" · ")}</p> : null}
        {card.showRating ? <RatingInline average={product.rating.average} count={product.rating.count} /> : null}
        <div className="mt-auto pt-2">
          <Price price={product.price} mrp={product.mrp} />
          {card.showDeliveryEta ? (
            <p className="mt-0.5 flex items-center gap-1 text-[0.6875rem] text-fg-subtle">
              <Icon name="truck" className="size-3" />
              {product.dhakaOnly || product.coldChain ? badges.dhakaOnlyLabel : deliveryConfig.zones[0].etaLabel}
            </p>
          ) : null}
        </div>
        {card.quickAdd ? (
          <div className="product-card-action pt-2">
            <AddToCartCompact product={product} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0, className }: { products: ProductSummary[]; priorityCount?: number; className?: string }) {
  return (
    <div className={cn("product-grid", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card overflow-hidden rounded-xl bg-surface">
      <div className="skeleton aspect-[var(--card-aspect,1/1)] rounded-none" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-9 w-full" />
      </div>
    </div>
  );
}
