"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { features } from "@/config/features.config";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { toast, useCartStore, useIsWishlisted, useLineQty, useStockRequestStore, useUiStore, useWishlistStore, type AddResult } from "@/stores";
import type { ProductSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

function reportAdd(result: AddResult, product: ProductSummary, openCart: () => void) {
  if (result.ok) {
    toast({ tone: "success", title: "Added to cart", description: product.name, action: { label: "View cart", onClick: openCart } });
  } else {
    const msg = { stock: "This item is out of stock.", max: "You've reached the maximum quantity for this item.", lines: "Your cart is full." }[result.reason];
    toast({ tone: "error", title: msg });
  }
}

/** Minus / qty / plus control bound to a cart line. */
export function QtyStepper({ product, size = "sm", className }: { product: ProductSummary; size?: "sm" | "md"; className?: string }) {
  const qty = useLineQty(product.id, product.variantId);
  const setQty = useCartStore((s) => s.setQty);
  const add = useCartStore((s) => s.add);
  const key = `${product.id}:${product.variantId}`;
  const h = size === "sm" ? "h-9" : "h-11";
  return (
    <div className={cn("flex items-center overflow-hidden rounded-lg bg-primary text-primary-fg", h, className)}>
      <button type="button" className={cn("grid place-items-center hover:bg-primary-700", size === "sm" ? "w-8" : "w-11")} onClick={() => setQty(key, qty - 1)} aria-label={qty === 1 ? "Remove from cart" : "Decrease quantity"}>
        <Icon name={qty === 1 ? "trash" : "minus"} className="size-4" />
      </button>
      <span className="min-w-7 flex-1 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        className={cn("grid place-items-center hover:bg-primary-700 disabled:opacity-50", size === "sm" ? "w-8" : "w-11")}
        onClick={() => {
          const r = add(product, 1);
          if (!r.ok) reportAdd(r, product, () => {});
        }}
        disabled={qty >= product.maxQty}
        aria-label="Increase quantity"
      >
        <Icon name="plus" className="size-4" />
      </button>
    </div>
  );
}

/** Card-level "Add" button that turns into a stepper once the item is in the cart. */
export function AddToCartCompact({ product }: { product: ProductSummary }) {
  const t = useT();
  const qty = useLineQty(product.id, product.variantId);
  const add = useCartStore((s) => s.add);
  const open = useUiStore((s) => s.open);
  const requested = useStockRequestStore((s) => s.ids.includes(product.id));
  const request = useStockRequestStore((s) => s.request);

  if (!product.inStock) {
    if (!features.stockRequest) return null;
    return (
      <Button size="sm" variant="outline" className="w-full" disabled={requested} onClick={() => { request(product.id); toast({ title: t("product.requestSent") }); }}>
        {requested ? <Icon name="check" className="size-4" /> : <Icon name="bell" className="size-4" />}
        {requested ? "Requested" : t("product.notifyMe")}
      </Button>
    );
  }
  if (qty > 0) return <QtyStepper product={product} className="w-full" />;
  return (
    <Button size="sm" variant="secondary" className="w-full" onClick={() => reportAdd(add(product, 1), product, () => open("cart"))}>
      <Icon name="shopping-bag" className="size-4" />
      {t("common.add")}
    </Button>
  );
}

/** Full-size add to cart + buy now, used on the product page. */
export function AddToCartLarge({ product, qty, onAdded }: { product: ProductSummary; qty: number; onAdded?: () => void }) {
  const t = useT();
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const open = useUiStore((s) => s.open);
  const [busy, setBusy] = useState(false);
  if (!product.inStock) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        size="lg"
        variant="secondary"
        onClick={() => {
          const r = add(product, qty);
          reportAdd(r, product, () => open("cart"));
          if (r.ok) onAdded?.();
        }}
      >
        <Icon name="shopping-bag" className="size-5" />
        {t("common.addToCart")}
      </Button>
      <Button
        size="lg"
        loading={busy}
        onClick={() => {
          const r = add(product, qty);
          if (!r.ok && r.reason !== "max") return reportAdd(r, product, () => {});
          setBusy(true);
          router.push(routes.checkout());
        }}
      >
        {t("common.buyNow")}
      </Button>
    </div>
  );
}

export function WishlistButton({ product, className, withLabel }: { product: ProductSummary; className?: string; withLabel?: boolean }) {
  const active = useIsWishlisted(product.id);
  const toggle = useWishlistStore((s) => s.toggle);
  if (!features.wishlist) return null;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        const added = toggle(product);
        toast({ title: added ? "Saved to wishlist" : "Removed from wishlist", action: added ? { label: "View", href: routes.wishlist() } : undefined });
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors",
        withLabel ? "h-12 rounded-lg border border-line px-4 text-sm font-semibold hover:bg-muted" : "size-8 rounded-full bg-surface/90 shadow-sm backdrop-blur hover:scale-105",
        active ? "text-discount" : "text-fg-muted hover:text-discount",
        className,
      )}
    >
      <Icon name="heart" className="size-4" fill={active ? "currentColor" : "none"} />
      {withLabel ? (active ? "Saved" : "Save") : null}
    </button>
  );
}
