"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { ORDER_FLOW, canCancel, orderProgress, toast, useCartStore, useNotificationStore, useOrderStore, usePrescriptionStore } from "@/stores";
import type { Order, ProductSummary } from "@/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Breadcrumbs, EmptyState } from "@/components/ui/display";
import { Icon, type IconName } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";
import { OrderItemRow, OrderTotals, StatusBadge, deliveryLabel, paymentLabel, statusLabel } from "./order-bits";

const stepIcon: Record<string, IconName> = { pending: "clock", confirmed: "circle-check", processing: "package", shipped: "truck", delivered: "home" };
const stepText: Record<string, string> = {
  pending: "We've received your order.",
  confirmed: "A pharmacist has checked your order.",
  processing: "Your items are being packed.",
  shipped: "The rider is on the way.",
  delivered: "Delivered to your address.",
};

/** Re-tick every 30s so the simulated status advances while the page is open. */
function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function Timeline({ order, now }: { order: Order; now: number }) {
  const { status, timeline } = orderProgress(order, now);
  if (status === "cancelled") {
    const cancelled = order.timeline.find((x) => x.status === "cancelled");
    return (
      <div className="flex items-start gap-3 rounded-xl bg-danger/8 p-4">
        <Icon name="x" className="mt-0.5 size-5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-bold text-fg">Order cancelled</p>
          <p className="text-xs text-fg-muted">
            {cancelled ? formatDate(cancelled.at, true) : ""}
            {cancelled?.note ? ` · ${cancelled.note}` : ""}
          </p>
        </div>
      </div>
    );
  }
  const reachedIndex = ORDER_FLOW.indexOf(status);
  return (
    <ol className="relative grid gap-5 md:grid-cols-5 md:gap-2">
      {ORDER_FLOW.map((s, i) => {
        const done = i <= reachedIndex;
        const at = timeline.find((x) => x.status === s)?.at;
        return (
          <li key={s} className="relative flex gap-3 md:flex-col md:items-center md:text-center">
            {i < ORDER_FLOW.length - 1 ? (
              <span aria-hidden className={cn("absolute left-[1.1rem] top-9 h-[calc(100%-1rem)] w-0.5 md:left-[calc(50%+1.25rem)] md:top-[1.1rem] md:h-0.5 md:w-[calc(100%-2.5rem)]", i < reachedIndex ? "bg-success" : "bg-line")} />
            ) : null}
            <span className={cn("relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2", done ? "border-success bg-success text-white" : "border-line bg-surface text-fg-subtle", i === reachedIndex && "ring-4 ring-success/20")}>
              <Icon name={stepIcon[s]} className="size-4" />
            </span>
            <span className="min-w-0">
              <span className={cn("block text-sm font-semibold", done ? "text-fg" : "text-fg-subtle")}>{statusLabel(s)}</span>
              <span className="block text-xs text-fg-muted">{at ? formatDate(at, true) : stepText[s]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const t = useT();
  const now = useNow();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));
  const cancel = useOrderStore((s) => s.cancel);
  const add = useCartStore((s) => s.add);
  const notify = useNotificationStore((s) => s.push);
  const prescriptions = usePrescriptionStore((s) => s.items);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reordering, setReordering] = useState(false);

  if (!order) {
    return (
      <div className="card">
        <EmptyState icon="package" title="Order not found" text="This order isn't on this device. Orders are stored locally in this demo." action={<ButtonLink href={routes.orders()}>Back to orders</ButtonLink>} />
      </div>
    );
  }

  const { status } = orderProgress(order, now);
  const attached = prescriptions.filter((p) => order.prescriptionIds.includes(p.id));

  const reorder = async () => {
    setReordering(true);
    let fresh: ProductSummary[] = [];
    try {
      const res = await fetch(`/api/products?ids=${order.items.map((i) => i.productId).join(",")}`);
      if (res.ok) fresh = (await res.json()) as ProductSummary[];
    } catch {
      /* offline — nothing to add */
    }
    let added = 0;
    const missing: string[] = [];
    for (const item of order.items) {
      const product = fresh.find((p) => p.id === item.productId);
      if (product && add(product, item.qty).ok) added++;
      else missing.push(item.name);
    }
    setReordering(false);
    if (added) {
      toast({ tone: "success", title: `${added} item${added > 1 ? "s" : ""} added to cart`, description: missing.length ? `Unavailable: ${missing.join(", ")}` : undefined, action: { label: "Checkout", href: routes.checkout() } });
    } else {
      toast({ tone: "error", title: "These items are currently unavailable" });
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: t("account.title"), href: routes.account() }, { label: t("account.orders"), href: routes.orders() }, { label: order.id }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight text-fg md:text-2xl">
            <span className="font-mono">{order.id}</span> <StatusBadge status={status} />
          </h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            {t("account.placedOn")} {formatDate(order.createdAt, true)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={reorder} loading={reordering}>
            <Icon name="refresh" className="size-4" /> {t("account.reorder")}
          </Button>
          {canCancel(status) ? (
            <Button variant="outline" size="sm" className="text-danger hover:border-danger/40" onClick={() => setConfirmOpen(true)}>
              <Icon name="x" className="size-4" /> {t("account.cancelOrder")}
            </Button>
          ) : null}
        </div>
      </div>

      <section className="card p-5" aria-label="Tracking">
        <Timeline order={order} now={now} />
        {status !== "cancelled" && status !== "delivered" ? <p className="mt-4 text-xs text-fg-subtle">Demo tracking: statuses advance automatically over a few hours.</p> : null}
      </section>

      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        <section className="card px-4 md:px-5" aria-label="Items">
          <h2 className="border-b border-line py-3 text-sm font-bold text-fg">
            {t("account.items")} ({order.items.length})
          </h2>
          <ul className="divide-y divide-line">
            {order.items.map((it) => (
              <OrderItemRow key={`${it.productId}-${it.variantId}`} item={it} />
            ))}
          </ul>
        </section>
        <div className="space-y-4">
          <section className="card p-4" aria-label="Payment">
            <OrderTotals order={order} />
            <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-xs text-fg-muted">
              <Icon name="wallet" className="size-4" /> {paymentLabel(order.paymentMethodId)}
            </p>
          </section>
          <section className="card p-4 text-sm" aria-label="Delivery address">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-fg-subtle">{t("checkout.deliveryAddress")}</p>
            <p className="font-semibold text-fg">
              {order.address.name} · {order.address.phone}
            </p>
            <p className="text-fg-muted">{[order.address.street, order.address.area, order.address.district].filter(Boolean).join(", ")}</p>
            <p className="mt-2 text-xs text-fg-subtle">{deliveryLabel(order.deliveryOptionId)}</p>
            {order.note ? <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-fg-muted">“{order.note}”</p> : null}
          </section>
          {order.prescriptionIds.length ? (
            <section className="card p-4 text-sm" aria-label="Prescriptions">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-subtle">{t("account.prescriptions")}</p>
              {attached.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {attached.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.id} src={p.dataUrl} alt={p.fileName} className="aspect-[3/4] w-full rounded-lg border border-line object-cover" />
                  ))}
                </div>
              ) : (
                <p className="font-mono text-xs text-fg-muted">{order.prescriptionIds.join(", ")}</p>
              )}
              <Link href={routes.prescriptions()} className="mt-2 inline-block text-xs font-semibold text-primary-600 hover:underline">
                Manage prescriptions
              </Link>
            </section>
          ) : null}
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Cancel this order?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Keep order
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                cancel(order.id);
                notify({ title: "Order cancelled", body: `Order ${order.id} has been cancelled.`, href: routes.order(order.id) });
                setConfirmOpen(false);
                toast({ title: "Order cancelled" });
              }}
            >
              Cancel order
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">You can cancel until the order is packed. If you paid online, the amount is refunded to the original payment method within 3–5 working days.</p>
      </Modal>
    </div>
  );
}
