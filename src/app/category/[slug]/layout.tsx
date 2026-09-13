import { notFound } from "next/navigation";
import { catalog } from "@/services/catalog";

/**
 * Existence check outside the page's loading boundary so unknown categories
 * return a real 404 instead of a streamed "soft 404" with status 200.
 */
export default async function CategoryLayout({ children, params }: LayoutProps<"/category/[slug]">) {
  const { slug } = await params;
  if (!(await catalog.getCategory(slug))) notFound();
  return children;
}
