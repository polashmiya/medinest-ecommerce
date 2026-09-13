import type { NextConfig } from "next";

const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
if (imageBase) {
  try {
    const u = new URL(imageBase);
    remotePatterns.push({ protocol: u.protocol.replace(":", "") as "http" | "https", hostname: u.hostname, pathname: "/**" });
  } catch {
    /* ignore malformed env value */
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Set NEXT_BUILD_CACHE=0 where .next/cache is not preserved (or disk is tight).
    turbopackFileSystemCacheForBuild: process.env.NEXT_BUILD_CACHE !== "0",
  },
  images: {
    localPatterns: [{ pathname: "/images/**" }],
    remotePatterns,
    qualities: [60, 75, 85],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Browsers and crawlers request /favicon.ico directly; serve the SVG app icon.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon.svg" }];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
