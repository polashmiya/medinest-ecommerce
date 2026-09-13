import Link from "next/link";
import { notFound } from "next/navigation";
import { features } from "@/config/features.config";
import { seoConfig } from "@/config/seo.config";
import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/format";
import { activeFilterCount, parseListingParams } from "@/lib/listing-params";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";
import { catalog } from "@/services/catalog";
import type { CategoryNode } from "@/types";
import { departmentIcons } from "@/components/ui/icon";
import { JsonLd } from "@/components/ui/display";
import { ListingHero } from "@/components/listing/listing-hero";
import { ProductListing } from "@/components/listing/product-listing";

export async function generateMetadata(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const category = await catalog.getCategory(slug);
  if (!category) return {};
  const query = parseListingParams(sp);
  const page = query.page ?? 1;
  return pageMetadata({
    title: category.metaTitle || seoConfig.categoryTitle(category.name) + (page > 1 ? ` – Page ${page}` : ""),
    description: category.metaDescription || category.description,
    path: routes.category(category.slug) + (page > 1 ? `?page=${page}` : ""),
    // Filtered combinations are useful to shoppers but thin for search engines.
    noindex: activeFilterCount(query) > 0 || Boolean(query.sort),
  });
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const category = await catalog.getCategory(slug);
  if (!category) notFound();

  const query = parseListingParams(await props.searchParams);
  const [trail, tree, result] = await Promise.all([
    catalog.getCategoryTrail(category.id),
    catalog.getCategoryTree(),
    catalog.listProducts({ ...query, categoryId: category.id }),
  ]);

  // Children of this category, or its siblings when it is a leaf.
  const index = new Map<number, CategoryNode>();
  const walk = (nodes: CategoryNode[]) => nodes.forEach((n) => (index.set(n.id, n), walk(n.children)));
  walk(tree);
  const node = index.get(category.id);
  const parentNode = category.parentId != null ? index.get(category.parentId) : undefined;
  const subcategories = (node?.children.length ? node.children : (parentNode?.children ?? []).filter((c) => c.id !== category.id)).filter((c) => c.productCount > 0);
  const root = trail[0];

  const crumbs = [{ label: "Home", href: "/" }, ...trail.map((c) => ({ label: c.name, href: routes.category(c.slug) }))];
  const basePath = routes.category(category.slug);
  const top = result.items.slice(0, 10);

  return (
    <div className="container-app py-5 md:py-8">
      <ListingHero
        crumbs={crumbs}
        title={category.name}
        count={category.productCount || result.total}
        description={category.description}
        icon={departmentIcons[root?.type ?? ""] ?? "layout-grid"}
        subcategories={subcategories.slice(0, 24)}
      />
      <ProductListing basePath={basePath} query={query} result={result}>
        {features.seoContentBlock && (query.page ?? 1) === 1 && top.length ? (
          <section className="mt-12 rounded-2xl border border-line bg-surface p-5 md:p-7">
            <h2 className="text-lg font-extrabold text-fg">
              {category.name} price list in {siteConfig.country}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-fg-muted">{category.description}</p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-fg-subtle">
                    <th className="py-2 pr-4 font-semibold">Product</th>
                    <th className="py-2 pr-4 font-semibold">Brand</th>
                    <th className="py-2 pr-4 text-right font-semibold">MRP</th>
                    <th className="py-2 text-right font-semibold">Our price</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-4">
                        <Link href={routes.product(p.slug)} className="font-medium text-fg hover:text-primary-600 hover:underline">
                          {p.name} {p.strength}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-fg-muted">{p.brandName}</td>
                      <td className="py-2.5 pr-4 text-right text-fg-subtle">{formatPrice(p.mrp)}</td>
                      <td className="py-2.5 text-right font-semibold text-fg">{formatPrice(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-fg-subtle">Prices are updated regularly and include VAT. Prescription medicines are dispensed only against a valid prescription.</p>
          </section>
        ) : null}
      </ProductListing>
      <JsonLd data={[breadcrumbJsonLd(crumbs), itemListJsonLd(category.name, result.items.map((p) => ({ name: p.name, url: routes.product(p.slug) })))]} />
    </div>
  );
}
