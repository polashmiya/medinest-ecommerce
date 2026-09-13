"use client";

import Link from "next/link";
import { labelValue } from "@/lib/i18n";
import { deliveryConfig, paymentConfig } from "@/config/commerce.config";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Order, OrderItem, OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product/product-image";

const statusTone: Record<OrderStatus, Parameters<typeof Badge>[0]["tone"]> = {
  pending: "warning",
  confirmed: "info",
  processing: "primary",
  shipped: "accent",
  delivered: "success",
  cancelled: "danger",
};

export function statusLabel(status: OrderStatus) {
  return labelValue<Record<OrderStatus, string>>("account.statusLabels")[status] ?? status;
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={statusTone[status]}>{statusLabel(status)}</Badge>;
}

export function paymentLabel(id: string) {
  return paymentConfig.methods.find((m) => m.id === id)?.label ?? id;
}

export function deliveryLabel(id: string) {
  return deliveryConfig.options.find((o) => o.id === id)?.label ?? id;
}

/** Thumbnail for an order item (photo when present, generated art otherwise). */
export function OrderItemThumb({ item, className }: { item: OrderItem; className?: string }) {
  return (
    <span className={cn("block shrink-0 overflow-hidden rounded-lg border border-line bg-muted", className)}>
      <ProductImage
        product={{ id: item.productId, name: item.name, strength: item.strength, form: item.form, type: item.type, brandName: item.brandName, images: item.image ? [item.image] : [] }}
        sizes="64px"
      />
    </span>
  );
}

export function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <OrderItemThumb item={item} className="size-14" />
      <div className="min-w-0 flex-1">
        <Link href={routes.product(item.slug)} className="line-clamp-2 text-sm font-semibold text-fg hover:text-primary-600">
          {item.name} {item.strength ? <span className="font-normal text-fg-muted">{item.strength}</span> : null}
        </Link>
        <p className="text-xs text-fg-subtle">
          {item.qty} × {formatPrice(item.price)}
          {item.unitLabel ? ` · ${item.unitLabel}` : ""}
          {item.rxRequired ? " · Rx" : ""}
        </p>
      </div>
      <p className="shrink-0 text-sm font-bold text-fg">{formatPrice(item.price * item.qty)}</p>
    </li>
  );
}

/** Read-only totals for a placed order. */
export function OrderTotals({ order }: { order: Order }) {
  const t = order.totals;
  const row = "flex items-center justify-between gap-4 text-sm";
  return (
    <dl className="space-y-2">
      <div className={row}>
        <dt className="text-fg-muted">Subtotal (MRP)</dt>
        <dd className="font-semibold">{formatPrice(t.mrpTotal)}</dd>
      </div>
      {t.productDiscount > 0 ? (
        <div className={row}>
          <dt className="text-fg-muted">Discount</dt>
          <dd className="font-semibold text-success">−{formatPrice(t.productDiscount)}</dd>
        </div>
      ) : null}
      {t.couponDiscount > 0 ? (
        <div className={row}>
          <dt className="text-fg-muted">Coupon{order.coupon ? ` (${order.coupon.code})` : ""}</dt>
          <dd className="font-semibold text-success">−{formatPrice(t.couponDiscount)}</dd>
        </div>
      ) : null}
      <div className={row}>
        <dt className="text-fg-muted">Delivery</dt>
        <dd className="font-semibold">{t.deliveryFee ? formatPrice(t.deliveryFee) : <span className="text-success">Free</span>}</dd>
      </div>
      <div className={cn(row, "border-t border-line pt-2.5 text-base")}>
        <dt className="font-bold text-fg">Total</dt>
        <dd className="text-lg font-extrabold text-fg">{formatPrice(t.total)}</dd>
      </div>
    </dl>
  );
}
