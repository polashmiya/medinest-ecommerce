import { NextResponse, type NextRequest } from "next/server";
import { catalogConfig } from "@/config/catalog.config";
import { catalog } from "@/services/catalog";

/** Typeahead endpoint used by the header search box. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.slice(0, 80) ?? "";
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || catalogConfig.search.suggestionLimit, 20);
  const items = await catalog.suggest(q, limit);
  return NextResponse.json(items, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } });
}
