"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { catalogConfig } from "@/config/catalog.config";
import { formatPrice } from "@/lib/format";
import { activeFilterCount, listingHref } from "@/lib/listing-params";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores";
import type { ProductFacets, ProductQuery } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Radio } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Drawer } from "@/components/ui/overlay";

const filters = catalogConfig.filters;

function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b border-line py-3 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-fg [&::-webkit-details-marker]:hidden">
        {title}
        <Icon name="chevron-down" className="size-4 text-fg-subtle transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}

interface Props {
  query: ProductQuery;
  facets: ProductFacets;
  /** Show the product-type facet (search and brand pages span departments). */
  showType?: boolean;
  /** Hide the brand facet (e.g. on a brand page). */
  hideBrand?: boolean;
}

function useNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const go = (q: ProductQuery, patch: Partial<ProductQuery>) => start(() => router.push(listingHref(pathname, q, patch), { scroll: false }));
  return { go, pending };
}

/** URL-driven facet filters. Every change is a navigation, so filtered pages are shareable. */
export function FilterPanel({ query, facets, showType, hideBrand }: Props) {
  const t = useT();
  const { go, pending } = useNavigate();
  const [brandFilter, setBrandFilter] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [min, setMin] = useState(query.priceMin?.toString() ?? "");
  const [max, setMax] = useState(query.priceMax?.toString() ?? "");

  const brands = useMemo(() => {
    const selected = new Set(query.brandIds ?? []);
    const list = facets.brands.filter((b) => b.label.toLowerCase().includes(brandFilter.toLowerCase()));
    // Keep selected brands visible even when collapsed.
    const sorted = [...list.filter((b) => selected.has(Number(b.id))), ...list.filter((b) => !selected.has(Number(b.id)))];
    return showAllBrands || brandFilter ? sorted : sorted.slice(0, filters.brandLimit);
  }, [facets.brands, brandFilter, showAllBrands, query.brandIds]);

  const toggleIn = <T,>(list: T[] | undefined, v: T) => (list?.includes(v) ? list.filter((x) => x !== v) : [...(list ?? []), v]);
  const bucket = filters.priceBuckets.find((b) => b.min === query.priceMin && (b.max ?? undefined) === query.priceMax);
  const count = activeFilterCount(query);

  return (
    <div className={cn("transition-opacity", pending && "pointer-events-none opacity-60")} aria-busy={pending}>
      <div className="flex items-center justify-between pb-2">
        <p className="flex items-center gap-2 text-base font-extrabold text-fg">
          <Icon name="sliders" className="size-4" /> {t("common.filter")}
          {pending ? <Icon name="loader" className="size-4 animate-spin text-primary-600" /> : null}
        </p>
        {count ? (
          <button
            type="button"
            className="text-xs font-semibold text-primary-600 hover:underline"
            onClick={() => go(query, { brandIds: [], types: [], forms: [], priceMin: undefined, priceMax: undefined, discountMin: undefined, ratingMin: undefined, inStock: undefined, rx: undefined })}
          >
            {t("common.clearAll")} ({count})
          </button>
        ) : null}
      </div>

      {filters.showAvailability ? (
        <Section title={t("listing.availability")}>
          <Checkbox label={t("listing.inStockOnly")} checked={Boolean(query.inStock)} onChange={(e) => go(query, { inStock: e.target.checked || undefined })} />
        </Section>
      ) : null}

      {filters.showRxFilter ? (
        <Section title="Prescription">
          <Radio name="rx" label={t("common.all")} checked={!query.rx} onChange={() => go(query, { rx: undefined })} />
          <Radio name="rx" label={t("listing.otcOnly")} checked={query.rx === "otc"} onChange={() => go(query, { rx: "otc" })} />
          <Radio name="rx" label={t("listing.rxOnly")} checked={query.rx === "rx"} onChange={() => go(query, { rx: "rx" })} />
        </Section>
      ) : null}

      {showType && facets.types.length > 1 ? (
        <Section title={t("listing.type")}>
          {facets.types.map((f) => (
            <Checkbox key={f.id} checked={query.types?.includes(String(f.id)) ?? false} onChange={() => go(query, { types: toggleIn(query.types, String(f.id)) })} label={<FacetLabel label={f.label} count={f.count} />} />
          ))}
        </Section>
      ) : null}

      {!hideBrand && facets.brands.length ? (
        <Section title={t("listing.brands")}>
          {facets.brands.length > filters.brandLimit ? (
            <Input value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} placeholder="Search brands" className="mb-1 h-9" aria-label="Search brands" />
          ) : null}
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {brands.map((b) => (
              <Checkbox key={b.id} checked={query.brandIds?.includes(Number(b.id)) ?? false} onChange={() => go(query, { brandIds: toggleIn(query.brandIds, Number(b.id)) })} label={<FacetLabel label={b.label} count={b.count} />} />
            ))}
            {!brands.length ? <p className="text-xs text-fg-subtle">No brands match “{brandFilter}”.</p> : null}
          </div>
          {!brandFilter && facets.brands.length > filters.brandLimit ? (
            <button type="button" className="text-xs font-semibold text-primary-600 hover:underline" onClick={() => setShowAllBrands((s) => !s)}>
              {showAllBrands ? t("common.showLess") : `${t("common.showMore")} (${facets.brands.length - filters.brandLimit})`}
            </button>
          ) : null}
        </Section>
      ) : null}

      {filters.showFormFilter && facets.forms.length > 1 ? (
        <Section title={t("listing.form")} defaultOpen={false}>
          <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {facets.forms.map((f) => (
              <Checkbox key={f.id} checked={query.forms?.includes(String(f.id)) ?? false} onChange={() => go(query, { forms: toggleIn(query.forms, String(f.id)) })} label={<FacetLabel label={f.label} count={f.count} />} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section title={t("listing.priceRange")}>
        {filters.priceBuckets.map((b) => (
          <Radio
            key={b.id}
            name="price"
            label={b.label}
            checked={bucket?.id === b.id}
            onChange={() => {
              setMin(String(b.min));
              setMax(b.max === null ? "" : String(b.max));
              go(query, { priceMin: b.min, priceMax: b.max ?? undefined });
            }}
          />
        ))}
        <form
          className="flex items-center gap-2 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            const lo = min === "" ? undefined : Math.max(0, Number(min));
            const hi = max === "" ? undefined : Math.max(0, Number(max));
            go(query, { priceMin: lo, priceMax: hi !== undefined && lo !== undefined && hi < lo ? lo : hi });
          }}
        >
          <Input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder={`Min ${formatPrice(facets.price.min)}`} aria-label="Minimum price" className="h-9 px-2 text-xs" />
          <span className="text-fg-subtle">–</span>
          <Input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder={`Max ${formatPrice(facets.price.max)}`} aria-label="Maximum price" className="h-9 px-2 text-xs" />
          <Button type="submit" size="sm" variant="outline" className="h-9 px-3" aria-label="Apply price range">
            <Icon name="arrow-right" className="size-4" />
          </Button>
        </form>
      </Section>

      <Section title={t("listing.discount")} defaultOpen={false}>
        <Radio name="discount" label={t("common.all")} checked={!query.discountMin} onChange={() => go(query, { discountMin: undefined })} />
        {filters.discountBuckets.map((b) => (
          <Radio key={b.id} name="discount" label={b.label} checked={query.discountMin === b.min} onChange={() => go(query, { discountMin: b.min })} />
        ))}
      </Section>

      {filters.showRatingFilter ? (
        <Section title={t("listing.rating")} defaultOpen={false}>
          <Radio name="rating" label={t("common.all")} checked={!query.ratingMin} onChange={() => go(query, { ratingMin: undefined })} />
          {[4, 3].map((r) => (
            <Radio key={r} name="rating" checked={query.ratingMin === r} onChange={() => go(query, { ratingMin: r })} label={<span className="inline-flex items-center gap-1">{r}<Icon name="star" className="size-3.5 text-amber-400" fill="currentColor" strokeWidth={0} /> {t("listing.andUp")}</span>} />
          ))}
        </Section>
      ) : null}
    </div>
  );
}

function FacetLabel({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex items-center justify-between gap-2">
      <span className="truncate">{label}</span>
      <span className="shrink-0 text-xs text-fg-subtle">{count}</span>
    </span>
  );
}

/** "Filters" button + bottom sheet for small screens. */
export function MobileFilters(props: Props) {
  const t = useT();
  const panel = useUiStore((s) => s.panel);
  const open = useUiStore((s) => s.open);
  const close = useUiStore((s) => s.close);
  const count = activeFilterCount(props.query);
  return (
    <>
      <Button variant="outline" size="sm" className="lg:hidden" onClick={() => open("filters")}>
        <Icon name="sliders" className="size-4" /> {t("common.filter")}
        {count ? <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.6875rem] text-primary-fg">{count}</span> : null}
      </Button>
      <Drawer open={panel === "filters"} onClose={close} side="bottom" title={t("common.filter")} footer={<Button className="w-full" onClick={close}>{t("common.done")}</Button>}>
        <div className="px-5 pb-4">
          <FilterPanel {...props} />
        </div>
      </Drawer>
    </>
  );
}

/** Sort dropdown bound to the URL. */
export function SortSelect({ query }: { query: ProductQuery }) {
  const t = useT();
  const { go, pending } = useNavigate();
  const value = query.sort ?? (query.search ? "relevance" : catalogConfig.listing.defaultSort);
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-fg-muted sm:inline">{t("common.sort")}</span>
      <select
        value={value}
        onChange={(e) => go(query, { sort: e.target.value === "relevance" ? undefined : (e.target.value as ProductQuery["sort"]) })}
        className={cn("h-9 rounded-lg border border-line bg-surface px-3 pr-8 text-sm font-medium text-fg focus:border-primary-500 focus:outline-none", pending && "opacity-60")}
        aria-label={t("common.sort")}
      >
        {query.search ? <option value="relevance">Relevance</option> : null}
        {catalogConfig.sortOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
