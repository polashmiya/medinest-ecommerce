"use client";

import { useEffect, useMemo, useState } from "react";
import { zoneById } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { useCartStore, useCartTotals, useDeliveryStore, useHydrated } from "@/stores";
import type { ProductListResult, ProductSummary } from "@/types";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs, EmptyState, SectionHeader, Skeleton } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { CartLineItem } from "@/components/cart/cart-line";
import { CouponForm, FreeDeliveryProgress, TotalsTable } from "@/components/cart/cart-summary";
import { DeliveryAction } from "@/components/layout/header-actions";
import { ProductCard } from "@/components/product/product-card";
import { Rail } from "@/components/product/rail";
import { DeliveryWarning } from "./delivery-warning";
import { undeliverableLines } from "./restrictions";

/** "You may also like" rail, fetched client-side and excluding items already in the cart. */
function CartSuggestions() {
  const lines = useCartStore((s) => s.lines);
  const [items, setItems] = useState<ProductSummary[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/products?tag=best-picks&perPage=24", { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<ProductListResult>) : null))
      .then((data) => data && setItems(data.items))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const inCart = useMemo(() => new Set(lines.map((l) => l.productId)), [lines]);
  const shown = items.filter((p) => !inCart.has(p.id)).slice(0, 12);
  if (!shown.length) return null;
  return (
    <section className="mt-12" aria-label="You may also like">
      <SectionHeader title="You may also like" subtitle="Popular picks other customers add to their cart" />
      <Rail label="You may also like">
        {shown.map((p) => (
          <div key={p.id} className="rail-item snap-start">
            <ProductCard product={p} className="h-full" />
          </div>
        ))}
      </Rail>
    </section>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="card space-y-4 p-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-20 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        ))}
      </div>
      <div className="card space-y-3 p-5">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}

export function CartView() {
  const t = useT();
  const hydrated = useHydrated();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const totals = useCartTotals();
  const zoneId = useDeliveryStore((s) => s.zoneId);
  const zone = zoneById(zoneId);
  const blocked = undeliverableLines(lines, zone);

  return (
    <div className="container-app py-6 md:py-8">
      <Breadcrumbs items={[{ label: t("common.home"), href: routes.home() }, { label: t("cart.title") }]} className="mb-4" />
      <h1 className="mb-6 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-fg">
        {t("cart.title")}
        {hydrated && totals.itemCount ? <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-semibold text-fg-muted">{totals.itemCount} items</span> : null}
      </h1>

      {!hydrated ? (
        <CartSkeleton />
      ) : !lines.length ? (
        <div className="card">
          <EmptyState
            icon="shopping-bag"
            title={t("cart.empty")}
            text={t("cart.emptyHint")}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <ButtonLink href={routes.categories()}>{t("cart.continueShopping")}</ButtonLink>
                <ButtonLink href={routes.uploadPrescription()} variant="outline">
                  <Icon name="file-up" className="size-4" /> {t("header.uploadPrescription")}
                </ButtonLink>
              </div>
            }
          />
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <FreeDeliveryProgress />
            <DeliveryWarning />
            {totals.rxCount ? (
              <p className="flex items-start gap-3 rounded-xl bg-rx/8 p-3.5 text-sm text-fg">
                <Icon name="file-text" className="mt-0.5 size-5 shrink-0 text-rx" />
                <span>
                  <span className="font-semibold">{t("cart.rxItems", { count: totals.rxCount })}.</span>{" "}
                  <span className="text-fg-muted">A licensed pharmacist reviews your prescription before dispatch — you can upload it at checkout.</span>
                </span>
              </p>
            ) : null}
            <div className="card px-4 md:px-5">
              <div className="flex items-center justify-between border-b border-line py-3">
                <p className="text-sm font-semibold text-fg">
                  {totals.lineCount} {totals.lineCount === 1 ? "product" : "products"}
                </p>
                <button type="button" onClick={clear} className="text-xs font-semibold text-fg-subtle hover:text-danger">
                  {t("common.clearAll")}
                </button>
              </div>
              <div className="divide-y divide-line">
                {lines.map((l) => (
                  <CartLineItem key={l.key} line={l} />
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-40">
            <div className="card p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-subtle">Delivery</p>
              <div className="flex items-center justify-between gap-3">
                <DeliveryAction className="-ml-2" />
                <span className="text-right text-xs text-fg-muted">
                  <span className="block font-semibold text-fg">{zone.label}</span>
                  {zone.etaLabel}
                </span>
              </div>
            </div>
            <div className="card space-y-4 p-4">
              <CouponForm />
              <TotalsTable />
              <ButtonLink href={routes.checkout()} size="lg" className="w-full" aria-disabled={blocked.length > 0} tabIndex={blocked.length ? -1 : undefined} onClick={(e) => blocked.length && e.preventDefault()}>
                {t("cart.checkout")} · {formatPrice(totals.total)}
                <Icon name="arrow-right" className="size-5" />
              </ButtonLink>
              {blocked.length ? <p className="text-center text-xs text-danger">Resolve the delivery issue above to continue.</p> : null}
              <p className="flex items-center justify-center gap-1.5 text-xs text-fg-subtle">
                <Icon name="lock" className="size-3.5" /> Secure checkout · cash on delivery available
              </p>
            </div>
          </aside>

          {/* Phones: total and checkout stay within thumb reach above the tab bar. */}
          <div className="mobile-chrome fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface/95 px-4 py-2.5 shadow-pop backdrop-blur md:hidden">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-fg-muted">
                  {t("cart.total")} · {totals.itemCount} items
                </p>
                <p className="text-lg font-extrabold leading-tight text-fg">{formatPrice(totals.total)}</p>
              </div>
              <ButtonLink href={routes.checkout()} className="shrink-0" aria-disabled={blocked.length > 0} tabIndex={blocked.length ? -1 : undefined} onClick={(e) => blocked.length && e.preventDefault()}>
                {t("cart.checkout")}
                <Icon name="arrow-right" className="size-4" />
              </ButtonLink>
            </div>
          </div>
          <div className="h-16 md:hidden" aria-hidden />
        </div>
      )}

      {hydrated ? <CartSuggestions /> : null}
    </div>
  );
}
