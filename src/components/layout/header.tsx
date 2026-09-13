import Link from "next/link";
import { features } from "@/config/features.config";
import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/types";
import { departmentIcons, Icon } from "@/components/ui/icon";
import { AccountAction, CartButton, DeliveryAction, SettingsAction, WishlistAction } from "./header-actions";
import { Logo } from "./logo";
import { BackButton, HeaderAutoHide } from "./mobile-header-controls";
import { MobileMenuButton } from "./mobile-menu";
import { SearchBox } from "./search-box";

const isEnabled = (feature?: string) => !feature || features[feature as keyof typeof features] !== false;

function TopBar() {
  const bar = navigationConfig.topBar;
  if (!bar.enabled) return null;
  return (
    <div className="hidden bg-primary-950 text-xs text-white/85 md:block">
      <div className="container-app flex h-9 items-center justify-between gap-6">
        <p className="flex items-center gap-2 truncate">
          <Icon name="truck" className="size-3.5 text-accent-300" />
          {bar.message}
        </p>
        <nav className="flex items-center gap-5" aria-label="Utility">
          <a href={siteConfig.contact.hotlineHref} className="flex items-center gap-1.5 hover:text-white">
            <Icon name="headphones" className="size-3.5" /> {siteConfig.contact.hotline}
          </a>
          {bar.links.filter((l) => isEnabled(l.feature)).map((l) => (
            <Link key={l.id} href={l.href} className="hover:text-white hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

/**
 * Department bar with hover / focus mega-menus (pure CSS, no client JS).
 * Each panel is anchored to the bar (not to its menu item) so it spans the
 * container and can never stick out past the viewport; closed panels are
 * `display: none`, so they take no space and cause no horizontal scrolling.
 */
function CategoryBar({ tree }: { tree: CategoryNode[] }) {
  return (
    <nav aria-label="Departments" className="hidden border-t border-line lg:block">
      <div className="container-app relative flex h-12 items-center gap-1">
        <Link href={routes.categories()} className="mr-2 flex h-9 shrink-0 items-center gap-2 rounded-lg bg-primary/10 px-3 text-sm font-bold text-primary-700 hover:bg-primary/15 dark:text-primary-300">
          <Icon name="layout-grid" className="size-4" />
          {t("header.categoriesMenu")}
        </Link>
        <ul className="flex min-w-0 flex-1 items-center">
          {/* Show as many departments as fit; the rest stay one click away under "All categories". */}
          {tree.slice(0, 8).map((root, i) => (
            <li key={root.id} className={cn("group/menu", i >= 4 && (i < 7 ? "hidden xl:block" : "hidden 2xl:block"))}>
              <Link href={routes.category(root.slug)} className="flex h-12 items-center gap-1 whitespace-nowrap px-2.5 text-sm font-medium text-fg-muted hover:text-primary-600 group-focus-within/menu:text-primary-600 xl:px-3">
                {root.name}
                {root.children.length ? <Icon name="chevron-down" className="size-3.5 opacity-60 transition-transform group-hover/menu:rotate-180" /> : null}
              </Link>
              {root.children.length ? (
                <div className="absolute inset-x-6 top-full z-40 hidden animate-pop rounded-b-2xl border border-line bg-surface p-6 shadow-pop group-focus-within/menu:block group-hover/menu:block">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-bold text-fg">
                      <Icon name={departmentIcons[root.type ?? ""] ?? "package"} className="size-4 text-primary-600" />
                      {root.name}
                    </p>
                    <Link href={routes.category(root.slug)} className="text-xs font-semibold text-primary-600 hover:underline">
                      Shop all {root.productCount} products →
                    </Link>
                  </div>
                  <div className="grid grid-cols-4 gap-x-8 gap-y-5 xl:grid-cols-5">
                    {root.children.slice(0, 10).map((child) => (
                      <div key={child.id}>
                        <Link href={routes.category(child.slug)} className="text-sm font-semibold text-fg hover:text-primary-600">
                          {child.name}
                        </Link>
                        {child.children.length ? (
                          <ul className="mt-1.5 space-y-1">
                            {child.children.slice(0, 5).map((g) => (
                              <li key={g.id}>
                                <Link href={routes.category(g.slug)} className="block truncate text-xs text-fg-muted hover:text-primary-600">
                                  {g.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
        {navigationConfig.categoryExtras.filter((l) => isEnabled(l.feature)).map((l) => (
          <Link key={l.id} href={l.href} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-fg hover:bg-muted">
            <Icon name={l.icon ?? "tag"} className={l.id === "flash" ? "size-4 text-discount" : "size-4 text-fg-muted"} fill={l.id === "flash" ? "currentColor" : "none"} />
            {l.label}
            {l.badge ? <span className="rounded bg-discount px-1 text-[0.625rem] font-bold text-white">{l.badge}</span> : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Horizontally scrolling department chips for tablets and phones. */
function CategoryChips({ tree }: { tree: CategoryNode[] }) {
  return (
    <nav aria-label="Departments" className="border-t border-line lg:hidden">
      <ul className="no-scrollbar container-app flex gap-2 overflow-x-auto py-2">
        {navigationConfig.categoryExtras.filter((l) => isEnabled(l.feature)).slice(0, 1).map((l) => (
          <li key={l.id}>
            <Link href={l.href} className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-discount/10 px-3 text-xs font-bold text-discount">
              <Icon name="zap" className="size-3.5" fill="currentColor" />
              {l.label}
            </Link>
          </li>
        ))}
        {tree.map((c) => (
          <li key={c.id}>
            <Link href={routes.category(c.slug)} className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 text-xs font-semibold text-fg-muted hover:border-primary-300">
              <Icon name={departmentIcons[c.type ?? ""] ?? "package"} className="size-3.5" />
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Header({ tree }: { tree: CategoryNode[] }) {
  return (
    <>
      <TopBar />
      <header className="site-header z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
        <HeaderAutoHide />
        <div className="container-app flex h-14 items-center gap-1.5 sm:h-16 md:gap-4 lg:h-[4.5rem]">
          <BackButton />
          <MobileMenuButton />
          <Logo className="site-logo shrink-0" />
          <nav aria-label="Services" className="ml-2 hidden items-center gap-0.5 rounded-full bg-muted p-1 2xl:flex">
            {navigationConfig.primaryTabs.filter((l) => isEnabled(l.feature)).map((l, i) => (
              <Link key={l.id} href={l.href} className={i === 0 ? "rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold text-primary-700 shadow-sm dark:text-primary-300" : "rounded-full px-3.5 py-1.5 text-sm font-medium text-fg-muted hover:text-fg"}>
                {l.label}
              </Link>
            ))}
          </nav>
          <DeliveryAction className="hidden shrink-0 xl:flex" />
          <SearchBox className="mx-2 hidden min-w-0 flex-1 md:block" />
          <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0 md:gap-1">
            {features.prescriptionUpload ? (
              <Link href={routes.uploadPrescription()} className="mr-1 hidden h-10 items-center gap-2 rounded-full border border-primary-300 px-3.5 text-sm font-semibold text-primary-700 hover:bg-primary/8 lg:flex dark:text-primary-300">
                <Icon name="file-up" className="size-4" />
                <span className="hidden xl:inline">{t("header.uploadPrescription")}</span>
                <span className="xl:hidden">Rx</span>
              </Link>
            ) : null}
            <div className="hidden sm:block">
              <SettingsAction />
            </div>
            <div className="hidden sm:block">
              <WishlistAction />
            </div>
            <AccountAction />
            <CartButton />
          </div>
        </div>
        <div className="container-app pb-3 md:hidden">
          <SearchBox />
        </div>
        <CategoryBar tree={tree} />
        <CategoryChips tree={tree} />
      </header>
    </>
  );
}
