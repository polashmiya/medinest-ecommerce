"use client";

import { useState } from "react";
import { couponConfig } from "@/config/commerce.config";
import { features } from "@/config/features.config";
import { formatPrice } from "@/lib/format";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { toast, useCartStore, useCartTotals } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";

export function FreeDeliveryProgress() {
  const t = useT();
  const totals = useCartTotals();
  if (!totals.lineCount) return null;
  const remaining = totals.freeDeliveryRemaining;
  const pct = remaining === null ? 100 : Math.max(4, Math.min(100, (totals.subtotal / (totals.subtotal + remaining)) * 100));
  return (
    <div className="rounded-xl bg-success/8 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold text-fg">
        <Icon name="truck" className="size-4 text-success" />
        {remaining === null ? t("cart.freeDeliveryUnlocked") : t("cart.freeDeliveryProgress", { amount: formatPrice(remaining) })}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-success/15">
        <div className="h-full rounded-full bg-success transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CouponForm() {
  const t = useT();
  const couponCode = useCartStore((s) => s.couponCode);
  const apply = useCartStore((s) => s.applyCoupon);
  const remove = useCartStore((s) => s.removeCoupon);
  const totals = useCartTotals();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (!features.coupons) return null;

  if (couponCode && totals.coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-success bg-success/8 p-3">
        <p className="text-sm">
          <span className="font-bold text-success">{totals.coupon.code}</span> <span className="text-fg-muted">— {totals.coupon.label}</span>
        </p>
        <button type="button" onClick={remove} className="text-xs font-semibold text-danger hover:underline">
          {t("common.remove")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!code.trim()) return;
          const r = apply(code);
          if (r.ok) {
            setError(null);
            setCode("");
            toast({ tone: "success", title: t("cart.couponApplied"), description: r.coupon.label });
          } else {
            setError(r.reason === "min" ? `Add items worth ${formatPrice(r.minSubtotal ?? 0)} or more to use this code.` : r.reason === "scope" ? "This code doesn't apply to items in your cart." : t("cart.couponInvalid"));
          }
        }}
      >
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t("cart.coupon")} aria-label={t("cart.coupon")} aria-invalid={Boolean(error)} className="h-10 uppercase" />
        <Button type="submit" variant="outline" size="sm" className="h-10">
          {t("cart.applyCoupon")}
        </Button>
      </form>
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {couponConfig.map((c) => (
          <button key={c.code} type="button" onClick={() => setCode(c.code)} className="rounded-md border border-dashed border-primary-300 px-2 py-1 text-[0.6875rem] font-bold text-primary-700 hover:bg-primary/8 dark:text-primary-300" title={c.label}>
            {c.code}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TotalsTable({ className }: { className?: string }) {
  const t = useT();
  const totals = useCartTotals();
  const row = "flex items-center justify-between gap-4 text-sm";
  return (
    <dl className={cn("space-y-2", className)}>
      <div className={row}>
        <dt className="text-fg-muted">{t("cart.subtotal")} (MRP)</dt>
        <dd className="font-semibold">{formatPrice(totals.mrpTotal)}</dd>
      </div>
      {totals.productDiscount > 0 ? (
        <div className={row}>
          <dt className="text-fg-muted">{t("cart.discount")}</dt>
          <dd className="font-semibold text-success">−{formatPrice(totals.productDiscount)}</dd>
        </div>
      ) : null}
      {totals.couponDiscount > 0 ? (
        <div className={row}>
          <dt className="text-fg-muted">Coupon ({totals.coupon?.code})</dt>
          <dd className="font-semibold text-success">−{formatPrice(totals.couponDiscount)}</dd>
        </div>
      ) : null}
      <div className={row}>
        <dt className="text-fg-muted">{t("cart.delivery")}</dt>
        <dd className="font-semibold">
          {totals.deliveryFee === 0 && totals.lineCount ? (
            <span className="text-success">
              {totals.deliveryFeeBeforeDiscount ? <del className="mr-1 font-normal text-fg-subtle">{formatPrice(totals.deliveryFeeBeforeDiscount)}</del> : null}
              {t("common.free")}
            </span>
          ) : (
            formatPrice(totals.deliveryFee)
          )}
        </dd>
      </div>
      {totals.vat > 0 ? (
        <div className={row}>
          <dt className="text-fg-muted">VAT</dt>
          <dd className="font-semibold">{formatPrice(totals.vat)}</dd>
        </div>
      ) : null}
      <div className={cn(row, "border-t border-line pt-3 text-base")}>
        <dt className="font-bold text-fg">{t("cart.total")}</dt>
        <dd className="text-lg font-extrabold text-fg">{formatPrice(totals.total)}</dd>
      </div>
      {totals.productDiscount + totals.couponDiscount > 0 ? (
        <p className="rounded-lg bg-success/8 px-3 py-2 text-center text-xs font-semibold text-success">
          {t("cart.youSaved", { amount: formatPrice(totals.productDiscount + totals.couponDiscount) })}
        </p>
      ) : null}
      {features.cashback && totals.cashback > 0 ? (
        <p className="flex items-center justify-center gap-1.5 text-xs text-fg-muted">
          <Icon name="gift" className="size-3.5 text-accent-600" /> {formatPrice(totals.cashback)} {t("cart.cashback").toLowerCase()} after delivery
        </p>
      ) : null}
    </dl>
  );
}
