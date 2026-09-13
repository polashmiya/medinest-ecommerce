"use client";

import { zoneById } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useT } from "@/lib/use-t";
import { useDeliveryStore } from "@/stores";
import { Icon } from "@/components/ui/icon";

/** Delivery promise for the customer's chosen district, with cold-chain / Dhaka-only warnings. */
export function DeliveryInfo({ coldChain, dhakaOnly }: { coldChain: boolean; dhakaOnly: boolean }) {
  const t = useT();
  const district = useDeliveryStore((s) => s.district);
  const zone = zoneById(useDeliveryStore((s) => s.zoneId));
  const restricted = (coldChain && !zone.coldChain) || (dhakaOnly && zone.id !== "dhaka");

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-fg">
        <Icon name="truck" className="size-4 text-primary-600" />
        {t("common.deliveryTo")} <span suppressHydrationWarning>{district}</span>
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-fg-muted">Estimated delivery</dt>
          <dd className="font-semibold text-fg" suppressHydrationWarning>
            {zone.etaLabel}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-fg-muted">{t("cart.delivery")}</dt>
          <dd className="text-right font-semibold text-fg" suppressHydrationWarning>
            {formatPrice(zone.fee)}
            {zone.freeAbove !== null ? <span className="block text-xs font-normal text-success">Free over {formatPrice(zone.freeAbove)}</span> : null}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-fg-muted">Payment</dt>
          <dd className="font-semibold text-fg">Cash on delivery available</dd>
        </div>
      </dl>
      {coldChain || dhakaOnly ? (
        <p className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-xs ${restricted ? "bg-danger/8 text-danger" : "bg-info/8 text-fg"}`} suppressHydrationWarning>
          <Icon name={coldChain ? "snowflake" : "map-pin"} className="mt-0.5 size-4 shrink-0" />
          <span>
            {coldChain ? `${t("product.coldChain")}. ` : ""}
            {t("product.dhakaOnly")}.
            {restricted ? " Change your delivery area in the header to order this item." : ""}
          </span>
        </p>
      ) : null}
    </div>
  );
}
