import Form from "next/form";
import Link from "next/link";
import { catalogConfig } from "@/config/catalog.config";
import { t } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { catalog } from "@/services/catalog";
import { ButtonLink } from "@/components/ui/button";
import { departmentIcons, Icon } from "@/components/ui/icon";

/** Friendly 404 with search and department shortcuts (Next.js adds noindex automatically). */
export default async function NotFound() {
  const tree = await catalog.getCategoryTree();
  return (
    <div className="container-app py-14 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-7xl font-extrabold tracking-tight text-primary-600 md:text-8xl">404</p>
        <h1 className="mt-4 text-2xl font-extrabold text-fg md:text-3xl">{t("errors.notFoundTitle")}</h1>
        <p className="mt-2 text-fg-muted">{t("errors.notFoundText")}</p>

        <Form action={routes.search()} className="relative mx-auto mt-8 max-w-lg" role="search">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-fg-subtle" />
          <input
            name="q"
            type="search"
            placeholder={t("common.searchPlaceholder")}
            aria-label={t("common.search")}
            className="h-12 w-full rounded-full border border-line bg-surface pl-12 pr-28 text-sm text-fg placeholder:text-fg-subtle focus:border-primary-500 focus:outline-none focus:ring-3 focus:ring-primary/15"
          />
          <button type="submit" className="absolute right-1.5 top-1.5 h-9 rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-700">
            {t("common.search")}
          </button>
        </Form>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          {catalogConfig.search.trendingQueries.slice(0, 6).map((q) => (
            <Link key={q} href={routes.search(q)} className="rounded-full bg-primary/8 px-3 py-1.5 font-medium text-primary-700 hover:bg-primary/15 dark:text-primary-300">
              {q}
            </Link>
          ))}
        </div>

        <ButtonLink href={routes.home()} variant="outline" className="mt-8">
          <Icon name="home" className="size-4" /> {t("errors.goHome")}
        </ButtonLink>
      </div>

      <div className="mx-auto mt-14 max-w-4xl">
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-fg-subtle">Popular departments</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {tree.slice(0, 8).map((c) => (
            <li key={c.id}>
              <Link href={routes.category(c.slug)} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 hover:border-primary-300 hover:shadow-card">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary-600">
                  <Icon name={departmentIcons[c.type ?? ""] ?? "package"} className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-fg">{c.name}</span>
                  <span className="block text-xs text-fg-subtle">{c.productCount} products</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
