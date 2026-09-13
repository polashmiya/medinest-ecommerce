"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { features } from "@/config/features.config";
import { navigationConfig } from "@/config/navigation.config";
import { cn } from "@/lib/utils";
import { useCartCount, useUiStore } from "@/stores";
import { Icon } from "@/components/ui/icon";
import { CountBadge } from "./header-actions";

/**
 * App-style bottom tab bar on phones: active tab gets a filled pill, taps give
 * a small press feedback, and the cart tab opens the cart sheet. Hidden while
 * the on-screen keyboard is up (see `.mobile-chrome` in globals.css).
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const count = useCartCount();
  const panel = useUiStore((s) => s.panel);
  const open = useUiStore((s) => s.open);
  // Checkout is a focused flow with its own pinned action bar.
  if (!features.mobileBottomNav || pathname.startsWith("/checkout")) return null;
  return (
    <nav aria-label="Primary" className="mobile-chrome fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-8px_rgb(15_23_42/0.15)] backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-5">
        {navigationConfig.mobileBottomNav.map((l) => {
          const active = l.id === "cart" ? panel === "cart" : l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          const cls = cn(
            "group flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors active:scale-95",
            active ? "text-primary-700 dark:text-primary-300" : "text-fg-muted",
          );
          const inner = (
            <>
              <span className={cn("relative grid h-8 w-14 place-items-center rounded-full transition-colors", active ? "bg-primary/12" : "group-active:bg-muted")}>
                <Icon name={l.icon ?? "home"} className="size-[22px]" strokeWidth={active ? 2.4 : 1.9} />
                {l.id === "cart" ? <CountBadge count={count} className="right-2 top-0" /> : null}
              </span>
              <span className={active ? "font-bold" : undefined}>{l.label}</span>
            </>
          );
          return (
            <li key={l.id}>
              {l.id === "cart" ? (
                <button type="button" onClick={() => open("cart")} className={cls} aria-label={`${l.label}${count ? ` (${count})` : ""}`}>
                  {inner}
                </button>
              ) : (
                <Link href={l.href} className={cls} aria-current={active ? "page" : undefined}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
