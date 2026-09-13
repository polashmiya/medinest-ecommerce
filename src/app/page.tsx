import { catalogConfig } from "@/config/catalog.config";
import { features } from "@/config/features.config";
import { homeConfig, type HomeSection, type RailSource } from "@/config/home.config";
import { seoConfig } from "@/config/seo.config";
import { pageMetadata } from "@/lib/seo";
import { catalog } from "@/services/catalog";
import type { ProductQuery, ProductSummary } from "@/types";
import { ProductRail } from "@/components/product/product-rail";
import { Newsletter, RecentlyViewedRail } from "@/components/home/client-sections";
import {
  AppPromo, BrandStrip, CategoryTiles, HeroSection, HomeFaq, PromoBanners, QuickActions, SeoContent, Stats, Steps, ValueProps,
} from "@/components/home/sections";

export const metadata = pageMetadata({ title: seoConfig.defaultTitle, description: seoConfig.defaultDescription, path: "/", absoluteTitle: true });

/** Translate a rail descriptor from home.config into a catalog query. */
function railQuery(source: RailSource): ProductQuery {
  switch (source.kind) {
    case "flash": return { flash: true, sort: "discount" };
    case "trending": return { sort: "trending" };
    case "newest": return { sort: "newest" };
    case "category": return { categorySlug: source.slug, sort: "popularity" };
    case "brand": return { brandSlug: source.slug, sort: "popularity" };
    case "tag": return { tag: source.tag, sort: "popularity" };
    case "type": return { types: [source.type], sort: "popularity" };
    case "ids": return { ids: source.ids };
  }
}

const sectionFlags: Partial<Record<HomeSection["type"], keyof typeof features>> = { newsletter: "newsletter", seoContent: "seoContentBlock" };

export default async function HomePage() {
  const sections = homeConfig.sections.filter((s) => {
    const flag = sectionFlags[s.type];
    if (flag && !features[flag]) return false;
    if (s.type === "productRail" && s.source.kind === "flash" && !features.flashSale) return false;
    return true;
  });

  // Resolve every product rail in parallel.
  const rails = new Map<string, ProductSummary[]>();
  await Promise.all(
    sections.map(async (s) => {
      if (s.type !== "productRail") return;
      const result = await catalog.listProducts({ ...railQuery(s.source), perPage: s.limit ?? catalogConfig.listing.railSize, inStock: true });
      rails.set(s.id, result.items);
    }),
  );
  const needsTree = sections.some((s) => s.type === "categoryTiles" || s.type === "seoContent");
  const [tree, brands, all] = await Promise.all([
    needsTree ? catalog.getCategoryTree() : Promise.resolve([]),
    sections.some((s) => s.type === "brandStrip") ? catalog.getBrands({ featured: true, limit: 16 }) : Promise.resolve([]),
    sections.some((s) => s.type === "stats") ? catalog.listProducts({ perPage: 1 }) : Promise.resolve(null),
  ]);

  return (
    <div className="container-app space-y-10 py-4 md:space-y-14 md:py-6">
      {sections.map((s) => {
        switch (s.type) {
          case "hero": return <HeroSection key={s.id} />;
          case "quickActions": return <QuickActions key={s.id} title={s.title} />;
          case "categoryTiles": return <CategoryTiles key={s.id} title={s.title} tree={tree} limit={s.limit} />;
          case "productRail":
            return (
              <div key={s.id} className="space-y-10 md:space-y-14">
                <ProductRail title={s.title} subtitle={s.subtitle} href={s.href} products={rails.get(s.id) ?? []} accent={s.accent === "danger" ? "danger" : undefined} />
                {s.id === "best" ? <RecentlyViewedRail /> : null}
              </div>
            );
          case "promoBanners": return <PromoBanners key={s.id} />;
          case "brandStrip": return <BrandStrip key={s.id} title={s.title} brands={brands.slice(0, s.limit ?? 16)} />;
          case "valueProps": return <ValueProps key={s.id} />;
          case "steps": return <Steps key={s.id} />;
          case "stats": return <Stats key={s.id} productCount={all?.total ?? 0} />;
          case "appPromo": return <AppPromo key={s.id} />;
          case "faq": return <HomeFaq key={s.id} />;
          case "seoContent": return <SeoContent key={s.id} tree={tree} />;
          case "newsletter": return <Newsletter key={s.id} />;
        }
      })}
    </div>
  );
}
