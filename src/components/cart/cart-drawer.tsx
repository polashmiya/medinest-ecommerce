"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { useCartStore, useCartTotals, useRecentStore, useUiStore } from "@/stores";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { Drawer } from "@/components/ui/overlay";
import { CartLineItem } from "./cart-line";
import { FreeDeliveryProgress, TotalsTable } from "./cart-summary";

/** Slide-over cart. Width follows the "cart panel width" display setting. */
export function CartDrawer() {
  const t = useT();
  const panel = useUiStore((s) => s.panel);
  const close = useUiStore((s) => s.close);
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const totals = useCartTotals();
  const recent = useRecentStore((s) => s.items);
  const pathname = usePathname();

  useEffect(() => close(), [pathname, close]);

  return (
    <Drawer
      open={panel === "cart"}
      onClose={close}
      title={
        <span className="flex items-center gap-2">
          <Icon name="shopping-bag" className="size-5 text-primary-600" />
          {t("cart.title")}
          {totals.itemCount ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-fg-muted">{totals.itemCount} items</span> : null}
        </span>
      }
      footer={
        lines.length ? (
          <div className="space-y-3">
            <TotalsTable />
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <ButtonLink href={routes.cart()} variant="outline" onClick={close}>
                View cart
              </ButtonLink>
              <ButtonLink href={routes.checkout()} onClick={close}>
                {t("cart.checkout")} · {formatPrice(totals.total)}
              </ButtonLink>
            </div>
          </div>
        ) : null
      }
    >
      {lines.length ? (
        <div className="px-5 pt-4">
          <FreeDeliveryProgress />
          {totals.rxCount ? (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-rx/8 p-3 text-xs text-fg">
              <Icon name="file-text" className="mt-0.5 size-4 shrink-0 text-rx" />
              {t("cart.rxItems", { count: totals.rxCount })} — you&apos;ll be asked to upload a prescription at checkout.
            </p>
          ) : null}
          <div className="divide-y divide-line">
            {lines.map((l) => (
              <CartLineItem key={l.key} line={l} compact onNavigate={close} />
            ))}
          </div>
          <button type="button" onClick={clear} className="mb-4 text-xs font-semibold text-fg-subtle hover:text-danger">
            {t("common.clearAll")}
          </button>
        </div>
      ) : (
        <div>
          <EmptyState icon="shopping-bag" title={t("cart.empty")} text={t("cart.emptyHint")} action={<ButtonLink href={routes.categories()} onClick={close}>{t("cart.continueShopping")}</ButtonLink>} />
          {recent.length ? (
            <div className="px-5 pb-6">
              <p className="mb-2 text-sm font-bold">Recently viewed</p>
              <ul className="space-y-1">
                {recent.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <a href={routes.product(p.slug)} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted">
                      <span className="truncate">{p.name}</span>
                      <span className="shrink-0 font-semibold">{formatPrice(p.price)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}
