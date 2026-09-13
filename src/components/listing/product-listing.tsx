import Link from "next/link";
import type { ReactNode } from "react";
import { catalogConfig } from "@/config/catalog.config";
import { formatNumber } from "@/lib/format";
import { t } from "@/lib/i18n";
import { listingHref } from "@/lib/listing-params";
import type { ProductListResult, ProductQuery } from "@/types";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Pagination } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ProductGrid } from "@/components/product/product-card";
import { FilterPanel, MobileFilters, SortSelect } from "./filter-panel";
import { ViewToggle } from "./view-toggle";

/** Removable chips for every active filter (plain links, so they work without JS). */
function ActiveFilters({ basePath, query, result }: { basePath: string; query: ProductQuery; result: ProductListResult }) {
  const chips: { label: string; href: string }[] = [];
  const brandName = (id: number) => result.facets.brands.find((b) => Number(b.id) === id)?.label ?? `Brand ${id}`;
  const typeName = (id: string) => result.facets.types.find((b) => b.id === id)?.label ?? id;
  for (const id of query.brandIds ?? []) chips.push({ label: brandName(id), href: listingHref(basePath, query, { brandIds: query.brandIds!.filter((x) => x !== id) }) });
  for (const id of query.types ?? []) chips.push({ label: typeName(id), href: listingHref(basePath, query, { types: query.types!.filter((x) => x !== id) }) });
  for (const f of query.forms ?? []) chips.push({ label: f, href: listingHref(basePath, query, { forms: query.forms!.filter((x) => x !== f) }) });
  if (query.priceMin !== undefined || query.priceMax !== undefined)
    chips.push({ label: `Price ${query.priceMin ?? 0}–${query.priceMax ?? "∞"}`, href: listingHref(basePath, query, { priceMin: undefined, priceMax: undefined }) });
  if (query.discountMin) chips.push({ label: `${query.discountMin}%+ off`, href: listingHref(basePath, query, { discountMin: undefined }) });
  if (query.ratingMin) chips.push({ label: `${query.ratingMin}★ & up`, href: listingHref(basePath, query, { ratingMin: undefined }) });
  if (query.inStock) chips.push({ label: t("listing.inStockOnly"), href: listingHref(basePath, query, { inStock: undefined }) });
  if (query.rx) chips.push({ label: query.rx === "rx" ? t("listing.rxOnly") : t("listing.otcOnly"), href: listingHref(basePath, query, { rx: undefined }) });
  if (!chips.length) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <Link key={c.label} href={c.href} scroll={false} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary/10 pl-3 pr-2 text-xs font-semibold text-primary-700 hover:bg-primary/15 dark:text-primary-300">
          {c.label}
          <Icon name="x" className="size-3.5" />
        </Link>
      ))}
      <Link
        href={listingHref(basePath, { search: query.search, sort: query.sort, perPage: query.perPage, tag: query.tag, genericId: query.genericId })}
        scroll={false}
        className="text-xs font-semibold text-fg-muted hover:text-danger hover:underline"
      >
        {t("common.clearAll")}
      </Link>
    </div>
  );
}

/**
 * Standard listing layout: filter sidebar, toolbar (count, sort, view), active
 * filters, product grid and crawlable pagination. Used by category, brand,
 * search and campaign pages.
 */
export function ProductListing({
  basePath,
  query,
  result,
  showType,
  hideBrand,
  emptyAction,
  children,
}: {
  basePath: string;
  query: ProductQuery;
  result: ProductListResult;
  showType?: boolean;
  hideBrand?: boolean;
  emptyAction?: ReactNode;
  /** Rendered below the grid (e.g. SEO copy). */
  children?: ReactNode;
}) {
  const from = result.total ? (result.page - 1) * result.perPage + 1 : 0;
  const to = Math.min(result.total, result.page * result.perPage);
  const filterProps = { query, facets: result.facets, showType, hideBrand };

  return (
    <div className="grid gap-6 lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-40 max-h-[calc(100dvh-11rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-4">
          <FilterPanel {...filterProps} />
        </div>
      </aside>

      <section aria-label="Products" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-fg-muted">
            {result.total ? t("listing.showing", { from: formatNumber(from), to: formatNumber(to), total: formatNumber(result.total) }) : t("common.noResults")}
          </p>
          <div className="flex items-center gap-2">
            <MobileFilters {...filterProps} />
            <SortSelect query={query} />
            <ViewToggle />
          </div>
        </div>

        <ActiveFilters basePath={basePath} query={query} result={result} />

        {result.items.length ? (
          <ProductGrid products={result.items} priorityCount={4} className="listing-grid" />
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-surface">
            <EmptyState
              icon="search"
              title={t("listing.noProducts")}
              text="Try removing a filter or searching for a different term."
              action={emptyAction ?? <ButtonLink href={listingHref(basePath, { search: query.search })} variant="outline">{t("listing.resetFilters")}</ButtonLink>}
            />
          </div>
        )}

        <div className="mt-8">
          <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(page) => listingHref(basePath, query, { page })} window={catalogConfig.listing.paginationWindow} />
        </div>
        {children}
      </section>
    </div>
  );
}
