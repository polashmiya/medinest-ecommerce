import { notFound } from "next/navigation";
import { seoConfig } from "@/config/seo.config";
import { siteConfig } from "@/config/site.config";
import { activeFilterCount, parseListingParams } from "@/lib/listing-params";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { catalog } from "@/services/catalog";
import { Breadcrumbs, JsonLd } from "@/components/ui/display";
import { BrandMonogram } from "@/components/listing/brand-tile";
import { ProductListing } from "@/components/listing/product-listing";

export async function generateMetadata(props: PageProps<"/brand/[slug]">) {
  const { slug } = await props.params;
  const brand = await catalog.getBrand(slug);
  if (!brand) return {};
  const query = parseListingParams(await props.searchParams);
  return pageMetadata({
    title: seoConfig.brandTitle(brand.name),
    description: brand.description || `Buy ${brand.name} products online in ${siteConfig.country}. Compare prices across ${brand.productCount} products with fast home delivery.`,
    path: routes.brand(brand.slug),
    noindex: activeFilterCount(query) > 0 || (query.page ?? 1) > 1,
  });
}

export default async function BrandPage(props: PageProps<"/brand/[slug]">) {
  const { slug } = await props.params;
  const brand = await catalog.getBrand(slug);
  if (!brand) notFound();
  const query = parseListingParams(await props.searchParams);
  const result = await catalog.listProducts({ ...query, brandSlug: brand.slug });
  const crumbs = [{ label: "Home", href: "/" }, { label: "Brands", href: routes.brands() }, { label: brand.name }];
  const typeLabels = result.facets.types.slice(0, 3).map((t) => t.label.toLowerCase());

  return (
    <div className="container-app py-5 md:py-8">
      <Breadcrumbs items={crumbs} className="mb-3" />
      <div className="mb-6 flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 md:flex-row md:items-center md:p-7">
        <BrandMonogram brand={brand} className="size-20 shrink-0 text-2xl" />
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{brand.name}</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {brand.productCount} products{typeLabels.length ? ` across ${typeLabels.join(", ")}` : ""}.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted">
            {brand.description ||
              `Every ${brand.name} product on ${siteConfig.name} is sourced from the manufacturer or an authorised distributor, stored as recommended and delivered with its original packaging and batch details.`}
          </p>
        </div>
      </div>
      <ProductListing basePath={routes.brand(brand.slug)} query={query} result={result} showType hideBrand />
      <JsonLd data={[breadcrumbJsonLd(crumbs), { "@context": "https://schema.org", "@type": "Brand", name: brand.name, url: new URL(routes.brand(brand.slug), siteConfig.url).toString() }]} />
    </div>
  );
}
