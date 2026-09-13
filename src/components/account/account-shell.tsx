"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { features } from "@/config/features.config";
import { navigationConfig } from "@/config/navigation.config";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { useAuthStore, useHydrated, useNotificationStore } from "@/stores";
import { Skeleton } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";

const isEnabled = (feature?: string) => !feature || features[feature as keyof typeof features] !== false;

/** Account area frame: auth guard + section navigation (sidebar on desktop, tabs on mobile). */
export function AccountShell({ children }: { children: ReactNode }) {
  const t = useT();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unread = useNotificationStore((s) => s.items.filter((n) => !n.read).length);
  const pathname = usePathname();
  const router = useRouter();
  const links = navigationConfig.accountMenu.filter((l) => isEnabled(l.feature));

  useEffect(() => {
    if (hydrated && !user) router.replace(routes.login(pathname));
  }, [hydrated, user, router, pathname]);

  const isActive = (href: string) => (href === routes.account() ? pathname === href : pathname.startsWith(href));

  if (!hydrated || !user) {
    return (
      <div className="container-app grid gap-6 py-8 lg:grid-cols-[260px_1fr]">
        <Skeleton className="hidden h-96 lg:block" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-6 md:py-8">
      <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-40">
          <div className="card hidden p-3 lg:block">
            <div className="mb-2 flex items-center gap-3 border-b border-line px-2 pb-3 pt-1">
              <span className="grid size-11 place-items-center rounded-full bg-primary text-lg font-bold text-primary-fg">{(user.name || user.phone).slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-fg">{user.name || "Customer"}</span>
                <span className="block text-xs text-fg-muted">{user.phone}</span>
              </span>
            </div>
            <nav aria-label="Account">
              <ul className="space-y-0.5">
                {links.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={l.href}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                        isActive(l.href) ? "bg-primary/10 text-primary-700 dark:text-primary-300" : "text-fg-muted hover:bg-muted hover:text-fg",
                      )}
                    >
                      <Icon name={l.icon ?? "user"} className="size-4" />
                      {l.label}
                      {l.id === "inbox" && unread ? <span className="ml-auto rounded-full bg-discount px-1.5 text-xs font-bold text-white">{unread}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push(routes.home());
              }}
              className="mt-2 flex w-full items-center gap-3 rounded-lg border-t border-line px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/8"
            >
              <Icon name="log-out" className="size-4" /> {t("common.logout")}
            </button>
          </div>

          <nav aria-label="Account" className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:hidden">
            <ul className="flex gap-2">
              {links.map((l) => (
                <li key={l.id}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium",
                      isActive(l.href) ? "border-primary-500 bg-primary/10 text-primary-700 dark:text-primary-300" : "border-line text-fg-muted",
                    )}
                  >
                    <Icon name={l.icon ?? "user"} className="size-4" />
                    {l.label}
                    {l.id === "inbox" && unread ? <span className="rounded-full bg-discount px-1.5 text-[0.625rem] font-bold text-white">{unread}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

/** Page heading used by every account screen. */
export function AccountHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-fg md:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-fg-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
