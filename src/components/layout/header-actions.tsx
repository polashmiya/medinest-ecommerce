"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deliveryConfig } from "@/config/commerce.config";
import { features } from "@/config/features.config";
import { navigationConfig } from "@/config/navigation.config";
import { zoneForDistrict } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { useAuthStore, useCartCount, useCartTotals, useDeliveryStore, useNotificationStore, useUiStore, useWishlistStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";

const isEnabled = (feature?: string) => !feature || features[feature as keyof typeof features] !== false;

export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={cn("absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-discount px-1 text-[0.6875rem] font-bold leading-none text-white ring-2 ring-surface", className)}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function CartButton() {
  const t = useT();
  const count = useCartCount();
  const { total } = useCartTotals();
  const open = useUiStore((s) => s.open);
  return (
    <button type="button" onClick={() => open("cart")} className="relative flex items-center gap-2.5 rounded-full bg-primary py-1.5 pl-1.5 pr-1.5 text-primary-fg hover:bg-primary-700 md:pr-4" aria-label={`${t("common.cart")} (${count})`}>
      <span className="relative grid size-8 place-items-center rounded-full bg-white/15">
        <Icon name="shopping-bag" className="size-[18px]" />
        <CountBadge count={count} className="ring-primary" />
      </span>
      <span className="hidden text-left leading-tight md:block">
        <span className="block text-[0.6875rem] opacity-80">{t("common.cart")}</span>
        <span className="block text-sm font-bold" suppressHydrationWarning>
          {formatPrice(total)}
        </span>
      </span>
    </button>
  );
}

export function IconAction({ href, icon, label, count, onClick }: { href?: string; icon: Parameters<typeof Icon>[0]["name"]; label: string; count?: number; onClick?: () => void }) {
  const inner = (
    <>
      <Icon name={icon} className="size-5" />
      {count !== undefined ? <CountBadge count={count} /> : null}
    </>
  );
  const cls = "relative grid size-10 place-items-center rounded-full text-fg-muted hover:bg-muted hover:text-fg";
  return href ? (
    <Link href={href} className={cls} aria-label={label} title={label}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} aria-label={label} title={label}>
      {inner}
    </button>
  );
}

export function WishlistAction() {
  const count = useWishlistStore((s) => s.items.length);
  if (!features.wishlist) return null;
  return <IconAction href={routes.wishlist()} icon="heart" label="Wishlist" count={count} />;
}

export function SettingsAction() {
  const t = useT();
  const open = useUiStore((s) => s.open);
  if (!features.uiSettingsPanel) return null;
  return <IconAction icon="palette" label={t("header.settings")} onClick={() => open("settings")} />;
}

export function AccountAction() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unread = useNotificationStore((s) => s.items.filter((n) => !n.read).length);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link href={routes.login(pathname)} rel="nofollow" className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold text-fg hover:bg-muted">
        <span className="grid size-8 place-items-center rounded-full bg-muted">
          <Icon name="user" className="size-[18px]" />
        </span>
        <span className="hidden xl:inline">{t("common.login")}</span>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className="relative flex items-center gap-2 rounded-full px-1.5 py-1.5 text-sm font-semibold text-fg hover:bg-muted">
        <span className="grid size-8 place-items-center rounded-full bg-primary/12 text-sm font-bold text-primary-700 dark:text-primary-300">
          {(user.name || user.phone).slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-24 truncate xl:inline">{user.name || t("common.account")}</span>
        <CountBadge count={unread} className="right-auto left-6" />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-60 animate-pop rounded-2xl border border-line bg-surface p-2 shadow-pop">
          <div className="border-b border-line px-3 pb-2.5 pt-1.5">
            <p className="truncate text-sm font-bold text-fg">{user.name || "Customer"}</p>
            <p className="text-xs text-fg-muted">{user.phone}</p>
          </div>
          <div className="py-1">
            {navigationConfig.accountMenu.filter((l) => isEnabled(l.feature)).map((l) => (
              <Link key={l.id} role="menuitem" href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg hover:bg-muted">
                <Icon name={l.icon ?? "user"} className="size-4 text-fg-muted" />
                {l.label}
                {l.id === "inbox" && unread ? <span className="ml-auto rounded-full bg-discount px-1.5 text-xs font-bold text-white">{unread}</span> : null}
              </Link>
            ))}
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-lg border-t border-line px-3 py-2.5 text-sm text-danger hover:bg-danger/8"
          >
            <Icon name="log-out" className="size-4" />
            {t("common.logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** "Deliver to" pill + district picker. The chosen zone drives fees and ETAs. */
export function DeliveryAction({ className }: { className?: string }) {
  const t = useT();
  const district = useDeliveryStore((s) => s.district);
  const setDistrict = useDeliveryStore((s) => s.setDistrict);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(district);
  const zone = zoneForDistrict(value);

  return (
    <>
      <button type="button" onClick={() => { setValue(district); setOpen(true); }} className={cn("flex items-center gap-2 rounded-full px-2 py-1.5 text-left hover:bg-muted", className)}>
        <Icon name="map-pin" className="size-5 shrink-0 text-primary-600" />
        <span className="leading-tight">
          <span className="block text-[0.6875rem] text-fg-subtle">{t("common.deliveryTo")}</span>
          <span className="flex items-center gap-0.5 text-sm font-semibold text-fg" suppressHydrationWarning>
            {district}
            <Icon name="chevron-down" className="size-3.5" />
          </span>
        </span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Choose your delivery area"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                setDistrict(value, zone.id);
                setOpen(false);
              }}
            >
              {t("common.save")}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-fg-muted">Delivery fees, timings and the availability of cold-chain items depend on your district.</p>
        <label htmlFor="district" className="mb-1.5 block text-sm font-semibold">
          District
        </label>
        <Select id="district" value={value} onChange={(e) => setValue(e.target.value)} data-autofocus>
          {deliveryConfig.districts.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </Select>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted p-3 text-center text-xs">
          <div>
            <p className="text-fg-subtle">Zone</p>
            <p className="mt-0.5 font-bold text-fg">{zone.label}</p>
          </div>
          <div>
            <p className="text-fg-subtle">Delivery</p>
            <p className="mt-0.5 font-bold text-fg">{zone.etaLabel}</p>
          </div>
          <div>
            <p className="text-fg-subtle">Fee</p>
            <p className="mt-0.5 font-bold text-fg">
              {formatPrice(zone.fee)}
              {zone.freeAbove !== null ? <span className="block font-normal text-fg-muted">free over {formatPrice(zone.freeAbove)}</span> : null}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
