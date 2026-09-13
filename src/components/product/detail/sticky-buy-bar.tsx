"use client";

import { useEffect, useState } from "react";
import { features } from "@/config/features.config";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types";
import { Price } from "@/components/ui/display";
import { AddToCartCompact } from "../cart-actions";

/**
 * Phone-only bar that appears once the main purchase box scrolls out of view,
 * keeping price and "Add" within thumb reach. Sits above the bottom navigation.
 */
export function StickyBuyBar({ product }: { product: ProductSummary }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("purchase-box");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "mobile-chrome fixed inset-x-0 z-30 border-t border-line bg-surface/95 px-4 py-2.5 shadow-pop backdrop-blur transition-transform duration-200 md:hidden",
        features.mobileBottomNav ? "bottom-[calc(4rem+env(safe-area-inset-bottom))]" : "bottom-0 pb-[calc(0.625rem+env(safe-area-inset-bottom))]",
        visible ? "translate-y-0" : "pointer-events-none translate-y-[150%]",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{product.name}</p>
          <Price price={product.price} mrp={product.mrp} size="sm" />
        </div>
        <div className="w-36 shrink-0">
          <AddToCartCompact product={product} />
        </div>
      </div>
    </div>
  );
}
