import type { NextRequest } from "next/server";
import { catalog } from "@/services/catalog";
import { productArtSvg } from "@/components/product/product-art";

/**
 * Standalone product illustration at /art/product/<id>. Product cards load it
 * through ProductImage (productArtUrl), so it must stay fast and cacheable.
 * A trailing ".svg" is tolerated for tools that expect an extension.
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/art/product/[id]">) {
  const { id } = await ctx.params;
  const productId = Number(id.replace(/\.svg$/i, ""));
  // The summary projection carries everything the illustration needs and skips detail assembly.
  const [product] = Number.isInteger(productId) ? await catalog.getProductsByIds([productId]) : [];
  if (!product) return new Response("Not found", { status: 404 });

  return new Response(productArtSvg(product, { standalone: true }), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      // The SVG is generated from our own data, but lock it down like any user-facing SVG.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
