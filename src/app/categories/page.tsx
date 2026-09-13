import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { catalog } from "@/services/catalog";
import { Breadcrumbs, JsonLd } from "@/components/ui/display";
import { departmentIcons, Icon } from "@/components/ui/icon";

export const metadata = pageMetadata({
  title: "All Categories – Medicine, Healthcare, Beauty & More",
  description: `Browse every department at ${siteConfig.name}: medicines, healthcare devices, beauty, baby & mom care, supplements, herbal, pet care and more.`,
  path: routes.categories(),
});

export default async function CategoriesPage() {
  const tree = await catalog.getCategoryTree();
  const crumbs = [{ label: "Home", href: "/" }, { label: "Categories" }];
  const total = tree.reduce((s, c) => s + c.productCount, 0);

  return (
    <div className="container-app py-5 md:py-8">
      <Breadcrumbs items={crumbs} className="mb-3" />
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">All categories</h1>
      <p className="mt-1 text-sm text-fg-muted">
        {tree.length} departments · {formatNumber(total)} products
      </p>

      <nav aria-label="Departments" className="no-scrollbar -mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1">
        {tree.map((c) => (
          <a key={c.id} href={`#${c.slug}`} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-medium hover:border-primary-300">
            <Icon name={departmentIcons[c.type ?? ""] ?? "package"} className="size-4 text-primary-600" />
            {c.name}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-6">
        {tree.map((root) => (
          <section key={root.id} id={root.slug} className="scroll-mt-40 rounded-2xl border border-line bg-surface p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <Link href={routes.category(root.slug)} className="group flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-fg">
                  <Icon name={departmentIcons[root.type ?? ""] ?? "package"} className="size-6" />
                </span>
                <span>
                  <span className="block text-lg font-extrabold text-fg group-hover:text-primary-700">{root.name}</span>
                  <span className="block text-xs text-fg-muted">{root.productCount} products</span>
                </span>
              </Link>
              <Link href={routes.category(root.slug)} className="text-sm font-semibold text-primary-600 hover:underline">
                Shop all →
              </Link>
            </div>
            {/* grid-cols-1 + min-w-0 let long names truncate instead of widening the page on phones. */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              {root.children.filter((c) => c.productCount > 0).map((child) => (
                <div key={child.id} className="min-w-0">
                  <Link href={routes.category(child.slug)} className="flex items-baseline justify-between gap-2 text-sm font-bold text-fg hover:text-primary-700">
                    {child.name}
                    <span className="text-xs font-normal text-fg-subtle">{child.productCount}</span>
                  </Link>
                  {child.children.length ? (
                    <ul className="mt-2 space-y-1.5">
                      {child.children.filter((g) => g.productCount > 0).slice(0, 8).map((g) => (
                        <li key={g.id}>
                          <Link href={routes.category(g.slug)} className="block truncate text-sm text-fg-muted hover:text-primary-700">
                            {g.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </div>
  );
}
