"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { unitLabel } from "@/services/catalog/summary";
import { useCartStore } from "@/stores";
import type { CartLine } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { QtyStepper } from "@/components/product/cart-actions";
import { ProductImage } from "@/components/product/product-image";

/** One cart line with thumbnail, price and quantity controls. */
export function CartLineItem({ line, compact, onNavigate }: { line: CartLine; compact?: boolean; onNavigate?: () => void }) {
  const remove = useCartStore((s) => s.remove);
  const p = line.snapshot;
  const href = routes.product(p.slug);
  return (
    <div className={cn("flex gap-3", compact ? "py-3" : "py-4")}>
      <Link href={href} onClick={onNavigate} className={cn("shrink-0 overflow-hidden rounded-lg border border-line bg-muted", compact ? "size-16" : "size-20 md:size-24")}>
        <ProductImage product={p} sizes="96px" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={href} onClick={onNavigate} className="line-clamp-2 text-sm font-semibold text-fg hover:text-primary-600">
              {p.name} {p.strength ? <span className="font-normal text-fg-muted">{p.strength}</span> : null}
            </Link>
            <p className="mt-0.5 truncate text-xs text-fg-subtle">{[p.brandName, unitLabel(p)].filter(Boolean).join(" · ")}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {p.rxRequired ? <Badge tone="rx">Rx</Badge> : null}
              {p.coldChain ? <Badge tone="info">Cold chain</Badge> : null}
              {p.discountPercent > 0 ? <Badge tone="success">{p.discountPercent}% off</Badge> : null}
            </div>
          </div>
          <button type="button" onClick={() => remove(line.key)} className="grid size-8 shrink-0 place-items-center rounded-full text-fg-subtle hover:bg-danger/10 hover:text-danger" aria-label={`Remove ${p.name}`}>
            <Icon name="trash" className="size-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <QtyStepper product={p} className="w-28" />
          <div className="text-right">
            <p className="text-sm font-extrabold text-fg">{formatPrice(p.price * line.qty)}</p>
            {p.mrp > p.price ? <del className="text-xs text-fg-subtle">{formatPrice(p.mrp * line.qty)}</del> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
