"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { features } from "@/config/features.config";
import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { useAuthStore, useUiStore } from "@/stores";
import { departmentIcons, Icon } from "@/components/ui/icon";
import { Drawer } from "@/components/ui/overlay";
import { Logo } from "./logo";

export interface NavCategory {
  id: number;
  name: string;
  slug: string;
  type?: string;
  children: { id: number; name: string; slug: string }[];
}

const isEnabled = (feature?: string) => !feature || features[feature as keyof typeof features] !== false;

export function MobileMenuButton() {
  const t = useT();
  const open = useUiStore((s) => s.open);
  return (
    <button type="button" onClick={() => open("menu")} className="grid size-10 place-items-center rounded-full text-fg hover:bg-muted lg:hidden" aria-label={t("header.menu")}>
      <Icon name="menu" className="size-6" />
    </button>
  );
}

/** Off-canvas navigation for small screens: departments, services and account links. */
export function MobileMenu({ categories }: { categories: NavCategory[] }) {
  const panel = useUiStore((s) => s.panel);
  const close = useUiStore((s) => s.close);
  const openPanel = useUiStore((s) => s.open);
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => close(), [pathname, close]);

  return (
    <Drawer open={panel === "menu"} onClose={close} side="left" title={<Logo />}>
      <div className="p-4">
        {user ? (
          <Link href={routes.account()} className="mb-4 flex items-center gap-3 rounded-xl bg-primary/8 p-3">
            <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-fg">{(user.name || user.phone).slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{user.name || "My account"}</span>
              <span className="block text-xs text-fg-muted">{user.phone}</span>
            </span>
          </Link>
        ) : (
          <Link href={routes.login(pathname)} rel="nofollow" className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-primary p-3 text-sm font-bold text-primary-fg">
            <Icon name="user" className="size-4" /> Login / Sign up
          </Link>
        )}

        <div className="mb-4 grid grid-cols-2 gap-2">
          {navigationConfig.orderBy.filter((l) => isEnabled(l.feature)).map((l) => (
            <a key={l.id} href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noopener noreferrer" : undefined} className="flex items-center gap-2 rounded-xl border border-line p-2.5 text-xs font-semibold">
              <Icon name={l.icon ?? "phone"} className="size-4 text-primary-600" />
              {l.label}
            </a>
          ))}
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-subtle">Shop by department</p>
        <ul className="mb-4">
          {categories.map((c) => (
            <li key={c.id} className="border-b border-line last:border-0">
              <div className="flex items-center">
                <Link href={routes.category(c.slug)} className="flex flex-1 items-center gap-3 py-2.5 text-sm font-semibold">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/8 text-primary-600">
                    <Icon name={departmentIcons[c.type ?? ""] ?? "package"} className="size-4" />
                  </span>
                  {c.name}
                </Link>
                {c.children.length ? (
                  <button type="button" onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="grid size-9 place-items-center rounded-full text-fg-muted hover:bg-muted" aria-expanded={expanded === c.id} aria-label={`Show ${c.name} subcategories`}>
                    <Icon name="chevron-down" className={`size-4 transition-transform ${expanded === c.id ? "rotate-180" : ""}`} />
                  </button>
                ) : null}
              </div>
              {expanded === c.id ? (
                <ul className="mb-2 ml-11 space-y-0.5">
                  {c.children.map((ch) => (
                    <li key={ch.id}>
                      <Link href={routes.category(ch.slug)} className="block rounded-md px-2 py-1.5 text-sm text-fg-muted hover:bg-muted hover:text-fg">
                        {ch.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-subtle">Explore</p>
        <ul className="space-y-0.5 text-sm">
          {[...navigationConfig.categoryExtras, ...navigationConfig.primaryTabs.slice(1)].filter((l) => isEnabled(l.feature)).map((l) => (
            <li key={l.id}>
              <Link href={l.href} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted">
                <Icon name={l.icon ?? "arrow-right"} className="size-4 text-fg-muted" />
                {l.label}
              </Link>
            </li>
          ))}
          {features.uiSettingsPanel ? (
            <li>
              <button type="button" onClick={() => openPanel("settings")} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted">
                <Icon name="palette" className="size-4 text-fg-muted" /> Display settings
              </button>
            </li>
          ) : null}
          <li>
            <a href={siteConfig.contact.hotlineHref} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted">
              <Icon name="headphones" className="size-4 text-fg-muted" /> {siteConfig.contact.hotline}
            </a>
          </li>
        </ul>
      </div>
    </Drawer>
  );
}
