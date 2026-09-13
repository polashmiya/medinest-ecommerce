"use client";

import { formatDate, formatPrice } from "@/lib/format";
import { zoneForDistrict } from "@/lib/cart";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { useHydrated, useOrderStore } from "@/stores";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { OrderItemRow, OrderTotals, deliveryLabel, paymentLabel } from "@/components/account/order-bits";

/** Original celebratory mark: a parcel with a check, surrounded by confetti dots. */
function SuccessArt() {
  return (
    <svg viewBox="0 0 160 120" className="mx-auto h-28 w-auto" aria-hidden>
      <circle cx="80" cy="62" r="46" className="fill-success/12" />
      <g className="fill-primary-400">
        <circle cx="22" cy="30" r="4" />
        <circle cx="140" cy="24" r="3" />
        <circle cx="132" cy="92" r="4" />
      </g>
      <g className="fill-accent-400">
        <rect x="30" y="86" width="8" height="8" rx="2" transform="rotate(20 34 90)" />
        <rect x="118" y="46" width="7" height="7" rx="2" transform="rotate(-15 121 49)" />
      </g>
      <path d="M52 50l28-14 28 14v30l-28 14-28-14z" className="fill-surface stroke-line" strokeWidth="2" />
      <path d="M52 50l28 14 28-14M80 64v30" className="stroke-line" strokeWidth="2" fill="none" />
      <circle cx="104" cy="82" r="15" className="fill-success" />
      <path d="M97 82l5 5 9-10" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OrderSuccessView({ id }: { id: string }) {
  const t = useT();
  const hydrated = useHydrated();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));

  if (!hydrated) {
    return (
      <div className="container-app max-w-2xl space-y-4 py-12">
        <Skeleton className="mx-auto h-28 w-40" />
        <Skeleton className="mx-auto h-6 w-2/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-app py-12">
        <div className="card">
          <EmptyState icon="package" title="We couldn't find that order" text="It may have been placed on another device. Check your orders list or contact support." action={<ButtonLink href={routes.orders()}>View my orders</ButtonLink>} />
        </div>
      </div>
    );
  }

  const zone = zoneForDistrict(order.address.district);
  const eta = order.deliveryOptionId === "express" ? "within 4 hours" : zone.etaLabel;

  return (
    <div className="container-app max-w-3xl py-10 md:py-14">
      <div className="text-center">
        <SuccessArt />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-fg md:text-3xl">{t("checkout.successTitle")}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{t("checkout.successText", { id: order.id })}</p>
        <div className="mx-auto mt-5 grid max-w-xl grid-cols-2 gap-3 text-left sm:grid-cols-3">
          <div className="card p-3">
            <p className="text-xs text-fg-subtle">Order ID</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-fg">{order.id}</p>
          </div>
          <div className="card p-3">
            <p className="text-xs text-fg-subtle">Estimated delivery</p>
            <p className="mt-0.5 text-sm font-bold text-fg">{eta}</p>
          </div>
          <div className="card col-span-2 p-3 sm:col-span-1">
            <p className="text-xs text-fg-subtle">Amount</p>
            <p className="mt-0.5 text-sm font-bold text-fg">
              {formatPrice(order.totals.total)} <span className="font-normal text-fg-muted">· {paymentLabel(order.paymentMethodId)}</span>
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href={routes.order(order.id)}>
            <Icon name="truck" className="size-4" /> {t("checkout.trackOrder")}
          </ButtonLink>
          <ButtonLink href={routes.home()} variant="outline">
            {t("cart.continueShopping")}
          </ButtonLink>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-[1fr_280px]">
        <section className="card px-4 md:px-5" aria-label="Items">
          <h2 className="border-b border-line py-3 text-sm font-bold text-fg">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </h2>
          <ul className="divide-y divide-line">
            {order.items.map((it) => (
              <OrderItemRow key={`${it.productId}-${it.variantId}`} item={it} />
            ))}
          </ul>
        </section>
        <div className="space-y-4">
          <section className="card p-4" aria-label="Payment summary">
            <OrderTotals order={order} />
          </section>
          <section className="card p-4 text-sm" aria-label="Delivery details">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-fg-subtle">Delivering to</p>
            <p className="font-semibold text-fg">{order.address.name} · {order.address.phone}</p>
            <p className="text-fg-muted">{[order.address.street, order.address.area, order.address.district].filter(Boolean).join(", ")}</p>
            <p className="mt-2 text-xs text-fg-subtle">
              {deliveryLabel(order.deliveryOptionId)} · placed {formatDate(order.createdAt, true)}
            </p>
            {order.prescriptionIds.length ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-rx">
                <Icon name="file-text" className="size-3.5" /> Prescription attached — a pharmacist will review it shortly.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
