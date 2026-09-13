import type { MetadataRoute } from "next";
import { seoConfig } from "@/config/seo.config";
import { siteConfig } from "@/config/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: seoConfig.robots.index ? "/" : undefined,
        disallow: seoConfig.robots.index ? seoConfig.robots.disallow : "/",
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host: siteConfig.url,
  };
}
