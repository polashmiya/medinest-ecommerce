import type { MetadataRoute } from "next";
import { seoConfig } from "@/config/seo.config";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { catalog } from "@/services/catalog";
import { content } from "@/services/content";

/**
 * One sitemap for the whole store (well under the 50,000-URL limit).
 *
 * If the catalog grows past that, split it with `generateSitemaps()` in a
 * route such as `app/product/sitemap.ts`: return `[{ id: 0 }, { id: 1 }, …]`
 * (one per `seoConfig.sitemap.chunkSize` products) and page through
 * `catalog.getProductIndex()` inside `sitemap({ id })`. In Next.js 16 `id`
 * arrives as a Promise: `const n = Number(await props.id)`.
 */
const STATIC_PAGES: { path: string; freq: keyof typeof seoConfig.sitemap.changeFrequency; priority: number }[] = [
  { path: routes.categories(), freq: "category", priority: 0.8 },
  { path: routes.brands(), freq: "brand", priority: 0.6 },
  { path: routes.flashSale(), freq: "home", priority: 0.8 },
  { path: routes.trending(), freq: "home", priority: 0.7 },
  { path: routes.newArrivals(), freq: "home", priority: 0.7 },
  { path: routes.labTest(), freq: "page", priority: 0.5 },
  { path: routes.doctor(), freq: "page", priority: 0.5 },
  { path: routes.blog(), freq: "category", priority: 0.5 },
  { path: routes.uploadPrescription(), freq: "page", priority: 0.6 },
  { path: routes.pharmacyRegister(), freq: "page", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  const freq = seoConfig.sitemap.changeFrequency;
  const [categories, brands, products, posts, pageSlugs] = await Promise.all([
    catalog.getCategories(),
    catalog.getBrands(),
    catalog.getProductIndex(),
    content.getBlogPosts(),
    content.getPageSlugs(),
  ]);

  return [
    { url: url(routes.home()), changeFrequency: freq.home, priority: 1 },
    ...STATIC_PAGES.map((p) => ({ url: url(p.path), changeFrequency: freq[p.freq], priority: p.priority })),
    ...pageSlugs.map((slug) => ({ url: url(routes.page(slug)), changeFrequency: freq.page, priority: 0.3 })),
    ...posts.map((p) => ({ url: url(routes.blogPost(p.slug)), changeFrequency: freq.page, priority: 0.4, lastModified: p.publishedAt })),
    ...categories
      .filter((c) => c.productCount > 0)
      .map((c) => ({ url: url(routes.category(c.slug)), changeFrequency: freq.category, priority: c.depth === 0 ? 0.9 : 0.7 })),
    ...brands.map((b) => ({ url: url(routes.brand(b.slug)), changeFrequency: freq.brand, priority: 0.5 })),
    ...products.map((p) => ({
      url: url(routes.product(p.slug)),
      changeFrequency: freq.product,
      priority: 0.6,
      ...(p.updatedAt ? { lastModified: p.updatedAt } : {}),
    })),
  ];
}
