import { NextResponse, type NextRequest } from "next/server";
import { parseListingParams } from "@/lib/listing-params";
import { catalog } from "@/services/catalog";

/**
 * Client-side product lookups:
 *   /api/products?ids=1,2,3   → ProductSummary[] (fresh prices for cart / wishlist)
 *   /api/products?{listing}   → ProductListResult
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const ids = sp.get("ids");
  if (ids) {
    const list = ids.split(",").map(Number).filter(Number.isFinite).slice(0, 100);
    return NextResponse.json(await catalog.getProductsByIds(list));
  }
  const raw = Object.fromEntries(sp.entries());
  const query = parseListingParams(raw);
  if (sp.get("category")) query.categorySlug = sp.get("category")!;
  if (sp.get("flash") === "1") query.flash = true;
  return NextResponse.json(await catalog.listProducts({ ...query, perPage: Math.min(query.perPage ?? 24, 96) }), {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
  });
}
