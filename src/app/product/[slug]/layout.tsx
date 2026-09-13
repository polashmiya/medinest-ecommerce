import { notFound } from "next/navigation";
import { catalog } from "@/services/catalog";

/**
 * Existence check outside the page's loading boundary. The page streams behind
 * loading.tsx, and once streaming starts the status is locked to 200; checking
 * here lets unknown slugs return a real 404. The lookup is memoised per request,
 * so the page's own call is free.
 */
export default async function ProductLayout({ children, params }: LayoutProps<"/product/[slug]">) {
  const { slug } = await params;
  if (!(await catalog.getProductBySlug(slug))) notFound();
  return children;
}
