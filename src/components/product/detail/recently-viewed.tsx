"use client";

import { useEffect } from "react";
import { features } from "@/config/features.config";
import { useT } from "@/lib/use-t";
import { useHydrated, useRecentStore } from "@/stores";
import type { ProductSummary } from "@/types";
import { SectionHeader } from "@/components/ui/display";
import { ProductCard } from "../product-card";
import { Rail } from "../rail";

/** Records the current product as viewed and shows the customer's other recent products. */
export function RecentlyViewed({ product, className }: { product: ProductSummary; className?: string }) {
  const t = useT();
  const hydrated = useHydrated();
  const items = useRecentStore((s) => s.items);
  const push = useRecentStore((s) => s.push);

  // Wait for localStorage to load first, otherwise the push would overwrite history.
  useEffect(() => {
    if (hydrated && features.recentlyViewed) push(product);
  }, [hydrated, product, push]);

  const others = items.filter((p) => p.id !== product.id);
  if (!features.recentlyViewed || !others.length) return null;
  return (
    <section className={className} aria-label={t("product.recentlyViewed")}>
      <SectionHeader title={t("product.recentlyViewed")} />
      <Rail label={t("product.recentlyViewed")}>
        {others.map((p) => (
          <div key={p.id} className="rail-item snap-start">
            <ProductCard product={p} className="h-full" />
          </div>
        ))}
      </Rail>
    </section>
  );
}
