import Link from "next/link";
import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Breadcrumbs, type Crumb } from "@/components/ui/display";
import { Icon, type IconName } from "@/components/ui/icon";

/** Page heading block for listing pages: breadcrumbs, title, count, blurb and child links. */
export function ListingHero({
  crumbs,
  title,
  count,
  description,
  icon,
  subcategories,
  aside,
}: {
  crumbs: Crumb[];
  title: string;
  count?: number;
  description?: string;
  icon?: IconName;
  subcategories?: { id: number; name: string; slug: string; productCount: number }[];
  aside?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <Breadcrumbs items={crumbs} className="mb-3" />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 md:p-7">
        <div aria-hidden className="absolute -right-16 -top-20 size-64 rounded-full bg-primary/10 blur-2xl" />
        <div aria-hidden className="absolute -bottom-24 right-32 size-56 rounded-full bg-accent-400/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {icon ? (
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-fg shadow-sm md:size-14">
                <Icon name={icon} className="size-6 md:size-7" />
              </span>
            ) : null}
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-fg md:text-3xl">{title}</h1>
              {count !== undefined ? <p className="mt-1 text-sm font-medium text-fg-muted">{formatNumber(count)} products</p> : null}
              {description ? <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-fg-muted">{description}</p> : null}
            </div>
          </div>
          {aside}
        </div>
        {subcategories?.length ? (
          <div className="relative mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-subtle">Browse subcategories</p>
            <ul className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap">
              {subcategories.map((c) => (
                <li key={c.id} className="shrink-0">
                  <Link href={routes.category(c.slug)} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-medium text-fg hover:border-primary-300 hover:text-primary-700 dark:hover:text-primary-300">
                    {c.name}
                    <span className="text-xs text-fg-subtle">{c.productCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
