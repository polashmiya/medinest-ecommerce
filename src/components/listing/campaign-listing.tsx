import type { ReactNode } from "react";
import { parseListingParams, type RawSearchParams } from "@/lib/listing-params";
import { breadcrumbJsonLd } from "@/lib/seo";
import { catalog } from "@/services/catalog";
import type { ProductQuery } from "@/types";
import { JsonLd } from "@/components/ui/display";
import type { IconName } from "@/components/ui/icon";
import { ListingHero } from "./listing-hero";
import { ProductListing } from "./product-listing";

/** Listing driven by a fixed base query (flash sale, trending, new arrivals…). */
export async function CampaignListing({
  basePath,
  title,
  description,
  icon,
  base,
  searchParams,
  aside,
}: {
  basePath: string;
  title: string;
  description: string;
  icon: IconName;
  base: Partial<ProductQuery>;
  searchParams: RawSearchParams;
  aside?: ReactNode;
}) {
  const parsed = parseListingParams(searchParams);
  const query: ProductQuery = { ...parsed, sort: parsed.sort ?? base.sort };
  const result = await catalog.listProducts({ ...base, ...query });
  const crumbs = [{ label: "Home", href: "/" }, { label: title }];
  return (
    <div className="container-app py-5 md:py-8">
      <ListingHero crumbs={crumbs} title={title} count={result.total} description={description} icon={icon} aside={aside} />
      <ProductListing basePath={basePath} query={query} result={result} showType />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </div>
  );
}
