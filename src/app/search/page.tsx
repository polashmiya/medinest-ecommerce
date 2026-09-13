import Link from "next/link";
import { catalogConfig } from "@/config/catalog.config";
import { seoConfig } from "@/config/seo.config";
import { t } from "@/lib/i18n";
import { parseListingParams } from "@/lib/listing-params";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { catalog } from "@/services/catalog";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/display";
import { departmentIcons, Icon } from "@/components/ui/icon";
import { ProductListing } from "@/components/listing/product-listing";
import { ProductRail } from "@/components/product/product-rail";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata(props: PageProps<"/search">) {
  const sp = await props.searchParams;
  const q = (first(sp.q) ?? first(sp.generic) ?? "").trim();
  return pageMetadata({
    title: q ? seoConfig.searchTitle(q) : "Search medicines & healthcare products",
    description: q ? `Compare prices for ${q} across brands and pack sizes. Fast home delivery and cash on delivery.` : undefined,
    path: routes.search(q || undefined),
    // Internal search result pages should not be indexed.
    noindex: true,
  });
}

export default async function SearchPage(props: PageProps<"/search">) {
  const sp = await props.searchParams;
  const generic = first(sp.generic)?.trim();
  const query = parseListingParams(sp);
  if (!query.search && generic) query.search = generic;

  if (!query.search) {
    const [tree, popular] = await Promise.all([catalog.getCategoryTree(), catalog.listProducts({ sort: "popularity", perPage: 12 })]);
    return (
      <div className="container-app py-6 md:py-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: t("common.search") }]} className="mb-4" />
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">What are you looking for?</h1>
        <p className="mt-1 text-sm text-fg-muted">Search by brand name, generic name, manufacturer or health concern.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {catalogConfig.search.trendingQueries.map((q) => (
            <Link key={q} href={routes.search(q)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary/10 px-3.5 text-sm font-medium text-primary-700 hover:bg-primary/15 dark:text-primary-300">
              <Icon name="trending-up" className="size-4" /> {q}
            </Link>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tree.map((c) => (
            <Link key={c.id} href={routes.category(c.slug)} className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center text-sm font-semibold hover:border-primary-300">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary-600">
                <Icon name={departmentIcons[c.type ?? ""] ?? "package"} className="size-5" />
              </span>
              {c.name}
            </Link>
          ))}
        </div>
        <ProductRail className="mt-10" title="Popular right now" products={popular.items} href={routes.trending()} />
      </div>
    );
  }

  const result = await catalog.listProducts(query);
  const q = query.search;

  return (
    <div className="container-app py-5 md:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: t("common.search"), href: routes.search() }, { label: q }]} className="mb-3" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">{t("listing.searchResultsFor", { query: q })}</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {result.total} {result.total === 1 ? t("common.result") : t("common.results")}
            {generic ? " for this generic across all brands" : ""}
          </p>
        </div>
      </div>
      <ProductListing
        basePath={routes.search()}
        query={query}
        result={result}
        showType
        emptyAction={
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-2">
              {catalogConfig.search.trendingQueries.slice(0, 6).map((s) => (
                <Link key={s} href={routes.search(s)} className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-muted">
                  {s}
                </Link>
              ))}
            </div>
            <ButtonLink href={routes.uploadPrescription()} variant="outline">
              <Icon name="file-up" className="size-4" /> Can&apos;t find it? Upload your prescription
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
