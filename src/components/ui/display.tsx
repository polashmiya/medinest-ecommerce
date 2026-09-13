import Link from "next/link";
import type { ReactNode } from "react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";

/* ------------------------------ Rating ------------------------------ */

export function Stars({ value, size = "sm", className }: { value: number; size?: "xs" | "sm" | "md"; className?: string }) {
  const px = size === "xs" ? "size-3" : size === "sm" ? "size-3.5" : "size-5";
  return (
    <span className={cn("inline-flex items-center", className)} role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className={cn("relative inline-block", px)}>
            <Icon name="star" className={cn("absolute inset-0 text-line", px)} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Icon name="star" className={cn("text-amber-400", px)} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function RatingInline({ average, count, className }: { average: number; count: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-fg-muted", className)}>
      <Icon name="star" className="size-3.5 text-amber-400" fill="currentColor" strokeWidth={0} />
      <span className="font-semibold text-fg">{average.toFixed(1)}</span>
      <span>({count})</span>
    </span>
  );
}

/* ------------------------------- Price ------------------------------- */

export function Price({ price, mrp, size = "md", className }: { price: number; mrp?: number; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const strike = mrp !== undefined && mrp > price;
  const main = { sm: "text-sm", md: "text-base", lg: "text-xl", xl: "text-3xl" }[size];
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
      <span className={cn("font-extrabold tracking-tight text-fg", main)}>{formatPrice(price)}</span>
      {strike ? <del className="text-xs font-medium text-fg-subtle">{formatPrice(mrp!)}</del> : null}
    </span>
  );
}

/* ---------------------------- Breadcrumbs ---------------------------- */

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs text-fg-muted", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <Icon name="chevron-right" className="size-3.5 text-fg-subtle" /> : null}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:text-primary-600 hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className="font-medium text-fg">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ----------------------------- Pagination ----------------------------- */

/** Link-based pagination (crawlable). `hrefFor` builds the URL for a page. */
export function Pagination({ page, totalPages, hrefFor, window = 2 }: { page: number; totalPages: number; hrefFor: (page: number) => string; window?: number }) {
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= window) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  const item = "grid h-10 min-w-10 place-items-center rounded-lg px-3 text-sm font-semibold";
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(item, "border border-line bg-surface hover:border-primary-300")} aria-label="Previous page">
          <Icon name="chevron-left" className="size-4" />
        </Link>
      ) : null}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-fg-subtle">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(item, p === page ? "bg-primary text-primary-fg" : "border border-line bg-surface text-fg hover:border-primary-300")}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(item, "border border-line bg-surface hover:border-primary-300")} aria-label="Next page">
          <Icon name="chevron-right" className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}

/* --------------------------- Layout helpers --------------------------- */

export function SectionHeader({ title, subtitle, href, linkLabel = "See all", accent, className, as: As = "h2" }: {
  title: ReactNode;
  subtitle?: ReactNode;
  href?: string;
  linkLabel?: string;
  accent?: "danger" | "primary";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <As className={cn("flex items-center gap-2 text-lg font-extrabold tracking-tight text-fg md:text-xl", accent === "danger" && "text-danger")}>
          {accent === "danger" ? <Icon name="zap" className="size-5" fill="currentColor" /> : null}
          {title}
        </As>
        {subtitle ? <p className="mt-0.5 text-sm text-fg-muted">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 hover:gap-2 hover:underline dark:text-primary-300" style={{ transition: "gap .15s" }}>
          {linkLabel}
          <Icon name="arrow-right" className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({ icon = "package", title, text, action, className }: { icon?: IconName; title: ReactNode; text?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-primary/10 text-primary-600 dark:text-primary-300">
        <Icon name={icon} className="size-7" />
      </div>
      <h3 className="text-base font-bold text-fg">{title}</h3>
      {text ? <p className="mt-1 max-w-sm text-sm text-fg-muted">{text}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden />;
}

/** Collapsible section built on <details>, so content stays in the HTML for SEO. */
export function Disclosure({ summary, children, defaultOpen, className }: { summary: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string }) {
  return (
    <details className={cn("group border-b border-line last:border-0", className)} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-fg [&::-webkit-details-marker]:hidden">
        {summary}
        <Icon name="chevron-down" className="size-4 shrink-0 text-fg-subtle transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-4 text-sm leading-relaxed text-fg-muted">{children}</div>
    </details>
  );
}

/** Serialises structured data safely into a <script type="application/ld+json">. */
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
