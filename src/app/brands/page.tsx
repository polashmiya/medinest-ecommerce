import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { catalog } from "@/services/catalog";
import { Breadcrumbs, JsonLd, SectionHeader } from "@/components/ui/display";
import { BrandDirectory } from "@/components/listing/brand-directory";
import { BrandTile } from "@/components/listing/brand-tile";

export const metadata = pageMetadata({
  title: `All Brands & Manufacturers in ${siteConfig.country}`,
  description: "Browse medicines and healthcare products by brand and manufacturer. Compare prices across trusted pharmaceutical and personal-care brands.",
  path: routes.brands(),
});

export default async function BrandsPage() {
  const [featured, all] = await Promise.all([catalog.getBrands({ featured: true, limit: 18 }), catalog.getBrands()]);
  const crumbs = [{ label: "Home", href: "/" }, { label: "Brands" }];
  return (
    <div className="container-app py-5 md:py-8">
      <Breadcrumbs items={crumbs} className="mb-3" />
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Shop by brand</h1>
      <p className="mt-1 text-sm text-fg-muted">{all.length} brands and manufacturers, all sourced through authorised distribution.</p>

      {featured.length ? (
        <section className="mt-8">
          <SectionHeader title="Featured brands" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featured.map((b) => (
              <BrandTile key={b.id} brand={b} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <SectionHeader title="All brands A–Z" />
        <BrandDirectory brands={all.map((b) => ({ id: b.id, name: b.name, slug: b.slug, productCount: b.productCount }))} />
      </section>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </div>
  );
}
