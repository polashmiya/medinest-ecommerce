import { siteConfig } from "./site.config";

/**
 * SEO defaults: metadata templates, robots, structured data.
 */
export const seoConfig = {
  titleTemplate: `%s | ${siteConfig.name}`,
  defaultTitle: `${siteConfig.name} – Buy Medicine, Beauty & Healthcare Products Online in ${siteConfig.country}`,
  defaultDescription: siteConfig.description,
  keywords: [
    "online pharmacy", "buy medicine online", "medicine price in bangladesh", "healthcare products", "beauty products",
    "baby care", "supplements", "home delivery medicine", siteConfig.name,
  ],
  ogImage: "/images/og-default.png",
  twitterHandle: "@medinest",
  /** Product page title pattern */
  productTitle: (name: string, form?: string, strength?: string, generic?: string) =>
    [name, form, strength ? `(${strength})` : "", generic ? `| ${generic}` : ""].filter(Boolean).join(" ").replace(/\s+/g, " ").trim(),
  categoryTitle: (name: string) => `${name} Price List in ${siteConfig.country} — All Brands`,
  brandTitle: (name: string) => `${name} Products Price in ${siteConfig.country}`,
  searchTitle: (q: string) => `Search results for “${q}”`,
  robots: {
    index: true,
    follow: true,
    disallow: ["/account", "/cart", "/checkout", "/login", "/api/", "/order-success"],
  },
  sitemap: {
    /** Cap product URLs per sitemap file. */
    chunkSize: 5000,
    changeFrequency: { home: "daily", category: "daily", product: "weekly", brand: "weekly", page: "monthly" } as const,
  },
  organization: {
    type: "Pharmacy",
    sameAs: Object.values(siteConfig.social),
  },
};
