"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { orderProgress, useOrderStore } from "@/stores";
import type { OrderStatus } from "@/types";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { AccountHeading } from "./account-shell";
import { OrderItemThumb, StatusBadge, paymentLabel } from "./order-bits";

type Tab = "all" | "active" | "delivered" | "cancelled";

const inTab = (tab: Tab, status: OrderStatus) =>
  tab === "all" || (tab === "active" ? status !== "delivered" && status !== "cancelled" : status === tab);

export function OrdersList() {
  const t = useT();
  const orders = useOrderStore((s) => s.orders);
  const [tab, setTab] = useState<Tab>("all");
  const withStatus = useMemo(() => orders.map((o) => ({ order: o, status: orderProgress(o).status })), [orders]);
  const shown = withStatus.filter((x) => inTab(tab, x.status));
  const count = (k: Tab) => withStatus.filter((x) => inTab(k, x.status)).length;
  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: t("common.all") },
    { id: "active", label: "Active" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      <AccountHeading title={t("account.orders")} subtitle="Track deliveries, reorder favourites and manage cancellations." />
      <div role="tablist" aria-label="Filter orders" className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition",
              tab === x.id ? "border-primary-500 bg-primary text-primary-fg" : "border-line bg-surface text-fg-muted hover:border-primary-300",
            )}
          >
            {x.label}
            <span className={cn("rounded-full px-1.5 text-xs", tab === x.id ? "bg-white/20" : "bg-muted")}>{count(x.id)}</span>
          </button>
        ))}
      </div>

      {!shown.length ? (
        <div className="card">
          <EmptyState icon="package" title={orders.length ? "No orders in this view" : t("account.noOrders")} action={<ButtonLink href={routes.categories()}>Browse products</ButtonLink>} />
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map(({ order: o, status }) => (
            <li key={o.id} className="card overflow-hidden">
              <Link href={routes.order(o.id)} className="block p-4 transition hover:bg-muted/40 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-fg">{o.id}</span>
                      <StatusBadge status={status} />
                    </p>
                    <p className="mt-1 text-xs text-fg-muted">
                      {t("account.placedOn")} {formatDate(o.createdAt, true)} · {paymentLabel(o.paymentMethodId)}
                    </p>
                  </div>
                  <p className="text-right text-base font-extrabold text-fg">{formatPrice(o.totals.total)}</p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 5).map((it) => (
                      <OrderItemThumb key={`${it.productId}-${it.variantId}`} item={it} className="size-12 ring-2 ring-surface" />
                    ))}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm text-fg-muted">
                    {o.items.map((i) => i.name).join(", ")}
                  </p>
                  <Icon name="chevron-right" className="size-5 shrink-0 text-fg-subtle" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
