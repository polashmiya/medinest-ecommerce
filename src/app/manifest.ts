import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { colorPresets, themeConfig } from "@/config/theme.config";

export default function manifest(): MetadataRoute.Manifest {
  const preset = colorPresets.find((p) => p.id === themeConfig.defaultColorPreset) ?? colorPresets[0];
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: themeConfig.surfaces.light.bg,
    theme_color: preset.primary[600],
    lang: siteConfig.language,
    categories: ["health", "medical", "shopping"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Search medicines", url: "/search" },
      { name: "Upload prescription", url: "/upload-prescription" },
      { name: "My orders", url: "/account/orders" },
    ],
  };
}
