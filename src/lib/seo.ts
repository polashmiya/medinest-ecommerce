import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { truncate } from "./utils";

/** Consistent per-page metadata: canonical URL, Open Graph and robots. */
export function pageMetadata({
  title,
  description,
  path,
  noindex,
  images,
  absoluteTitle,
}: {
  title: string;
  description?: string;
  path: string;
  noindex?: boolean;
  images?: string[];
  /** Skip the "| Site" title template. */
  absoluteTitle?: boolean;
}): Metadata {
  const desc = description ? truncate(description, 160) : undefined;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: path },
    openGraph: { title, description: desc, url: path, siteName: siteConfig.name, ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title, description: desc },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function breadcrumbJsonLd(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: new URL(c.href, siteConfig.url).toString() } : {}),
    })),
  };
}

/** ItemList structured data for listing pages. */
export function itemListJsonLd(name: string, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: new URL(it.url, siteConfig.url).toString() })),
  };
}
