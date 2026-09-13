"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { features } from "@/config/features.config";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { toast, useLineQty, useStockRequestStore } from "@/stores";
import type { ProductSummary, ProductUnit } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AddToCartLarge, WishlistButton } from "../cart-actions";
import { ShareButton } from "./share-button";

interface UnitOption {
  id: number;
  label: string;
  multiplier: number;
  /** Whole number of sales units this option represents (0 = informational only). */
  salesUnits: number;
}

/**
 * Pack options. A unit is purchasable when it is a whole multiple of the unit
 * we sell (e.g. a box of 27 strips); smaller units (a single tablet) are shown
 * as per-unit prices only.
 */
function unitOptions(units: ProductUnit[], p: ProductSummary): { options: UnitOption[]; defaultId: number } {
  const sales = p.unitMultiplier || 1;
  const list: UnitOption[] = units
    .map((u) => ({ id: u.id, label: u.label, multiplier: u.multiplier, salesUnits: u.multiplier >= sales && u.multiplier % sales === 0 ? u.multiplier / sales : 0 }))
    .sort((a, b) => a.multiplier - b.multiplier);
  if (!list.some((u) => u.multiplier === sales)) list.push({ id: -1, label: p.salesUnit || "Pack", multiplier: sales, salesUnits: 1 });
  list.sort((a, b) => a.multiplier - b.multiplier);
  const def = list.find((u) => u.multiplier === sales)!;
  return { options: list, defaultId: def.id };
}

export function PurchaseBox({ product, units }: { product: ProductSummary; units: ProductUnit[] }) {
  const t = useT();
  const { options, defaultId } = useMemo(() => unitOptions(units, product), [units, product]);
  const [unitId, setUnitId] = useState(defaultId);
  const [qty, setQty] = useState(1);
  const inCart = useLineQty(product.id, product.variantId);
  const requested = useStockRequestStore((s) => s.ids.includes(product.id));
  const request = useStockRequestStore((s) => s.request);

  const unit = options.find((o) => o.id === unitId) ?? options.find((o) => o.id === defaultId)!;
  const perBase = product.price / (product.unitMultiplier || 1);
  const mrpPerBase = product.mrp / (product.unitMultiplier || 1);
  const unitPrice = product.price * unit.salesUnits;
  const unitMrp = product.mrp * unit.salesUnits;
  const maxUnits = Math.max(1, Math.floor(product.maxQty / unit.salesUnits));
  const purchasable = options.filter((o) => o.salesUnits > 0);
  const infoOnly = options.filter((o) => o.salesUnits === 0);
  const showPerBase = product.baseUnit && product.unitMultiplier > 1;
  const describe = (o: UnitOption) => (o.multiplier > 1 && product.baseUnit && o.label !== product.baseUnit ? `${o.multiplier} ${product.baseUnit}${o.multiplier > 1 ? "s" : ""}` : "");

  return (
    <div id="purchase-box" className="rounded-2xl border border-line bg-surface p-4 md:p-5">
      <p className="text-xs font-medium text-fg-muted">
        {t("product.showPriceFor")} 1 {unit.label.toLowerCase()}
        {describe(unit) ? ` (${describe(unit)})` : ""}
      </p>
      <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="text-3xl font-extrabold tracking-tight text-fg">{formatPrice(unitPrice)}</span>
        {unitMrp > unitPrice ? (
          <>
            <del className="pb-1 text-base text-fg-subtle">{formatPrice(unitMrp)}</del>
            <Badge tone="discount" className="mb-1.5">
              {product.discountPercent}% {t("common.off")}
            </Badge>
          </>
        ) : null}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
        {unitMrp > unitPrice ? <span className="font-semibold text-success">{t("product.youSave", { amount: formatPrice(unitMrp - unitPrice) })}</span> : null}
        {showPerBase ? (
          <span>
            {formatPrice(perBase)} {t("product.perUnit", { unit: product.baseUnit.toLowerCase() })}
            {mrpPerBase > perBase ? <del className="ml-1 text-fg-subtle">{formatPrice(mrpPerBase)}</del> : null}
          </span>
        ) : null}
      </div>

      {purchasable.length > 1 ? (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-fg">{t("product.chooseUnit")}</p>
          <div role="radiogroup" aria-label={t("product.chooseUnit")} className="flex flex-wrap gap-2">
            {purchasable.map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={o.id === unit.id}
                onClick={() => {
                  setUnitId(o.id);
                  setQty(1);
                }}
                className={cn(
                  "min-w-24 rounded-xl border px-3 py-2 text-left transition",
                  o.id === unit.id ? "border-primary-500 bg-primary/8 ring-2 ring-primary/20" : "border-line hover:border-primary-300",
                )}
              >
                <span className="block text-sm font-bold text-fg">{o.label}</span>
                <span className="block text-xs text-fg-muted">{describe(o) || " "}</span>
                <span className="mt-0.5 block text-sm font-semibold text-primary-700 dark:text-primary-300">{formatPrice(product.price * o.salesUnits)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {infoOnly.length ? (
        <p className="mt-3 text-xs text-fg-subtle">
          {infoOnly.map((o) => `${formatPrice(perBase * o.multiplier)} per ${o.label.toLowerCase()}`).join(" · ")} (sold by the {unit.label.toLowerCase()} or larger)
        </p>
      ) : null}

      {product.inStock ? (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-fg">{t("product.quantity")}</p>
              <div className="flex h-11 items-center rounded-lg border border-line">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="grid h-full w-11 place-items-center text-fg hover:bg-muted disabled:opacity-40" aria-label="Decrease quantity">
                  <Icon name="minus" className="size-4" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxUnits}
                  value={qty}
                  onChange={(e) => setQty(Math.min(maxUnits, Math.max(1, Math.floor(Number(e.target.value) || 1))))}
                  className="h-full w-14 border-x border-line bg-transparent text-center text-sm font-bold text-fg [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label={t("product.quantity")}
                />
                <button type="button" onClick={() => setQty((q) => Math.min(maxUnits, q + 1))} disabled={qty >= maxUnits} className="grid h-full w-11 place-items-center text-fg hover:bg-muted disabled:opacity-40" aria-label="Increase quantity">
                  <Icon name="plus" className="size-4" />
                </button>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-fg-muted">
                {qty} × {unit.label.toLowerCase()}
              </p>
              <p className="text-xl font-extrabold text-fg">{formatPrice(unitPrice * qty)}</p>
            </div>
          </div>
          {qty >= maxUnits ? <p className="mt-2 text-xs text-warning">{t("cart.maxQty", { qty: maxUnits })}</p> : null}
          <div className="mt-4">
            <AddToCartLarge product={product} qty={qty * unit.salesUnits} onAdded={() => setQty(1)} />
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-xl bg-muted p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Icon name="package" className="size-4 text-fg-muted" /> {t("product.outOfStock")}
          </p>
          {features.stockRequest ? (
            <Button
              className="mt-3 w-full"
              variant="outline"
              disabled={requested}
              onClick={() => {
                request(product.id);
                toast({ tone: "success", title: t("product.requestSent") });
              }}
            >
              <Icon name={requested ? "check" : "bell"} className="size-4" />
              {requested ? t("product.requestSent") : t("product.notifyMe")}
            </Button>
          ) : null}
        </div>
      )}

      {inCart > 0 ? (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-fg-muted">
          <Icon name="circle-check" className="size-4 text-success" />
          {inCart} {(product.salesUnit || "item").toLowerCase()}
          {inCart > 1 ? "s" : ""} in your cart ·{" "}
          <Link href={routes.cart()} className="font-semibold text-primary-600 hover:underline dark:text-primary-300">
            {t("common.viewDetails")}
          </Link>
        </p>
      ) : null}

      <div className="mt-4 flex gap-2 border-t border-line pt-4">
        <WishlistButton product={product} withLabel className="flex-1" />
        <ShareButton title={product.name} className="flex-1" />
      </div>
    </div>
  );
}
