"use client";

import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { catalogConfig } from "@/config/catalog.config";
import { cartConfig } from "@/config/commerce.config";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import type { SearchSuggestion } from "@/types";
import { Icon, type IconName } from "@/components/ui/icon";
import { productArtSvg } from "@/components/product/product-art";

const RECENT_KEY = cartConfig.storageKeys.searches;
const typeIcon: Record<SearchSuggestion["type"], IconName> = { product: "pill", category: "layout-grid", brand: "tags", generic: "flask-conical", query: "search" };

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Header search with typeahead. Works as a plain GET form without JavaScript;
 * with JS it shows suggestions (products, generics, categories, brands),
 * recent and trending searches, and supports keyboard navigation.
 */
export function SearchBox({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const t = useT();
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapper = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const query = q.trim();
  const tooShort = query.length < catalogConfig.search.minChars;

  useEffect(() => {
    if (tooShort) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        if (res.ok) {
          setItems((await res.json()) as SearchSuggestion[]);
          setActive(-1);
        }
      } catch {
        /* aborted or offline */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, catalogConfig.search.debounceMs);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, tooShort]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const shown = tooShort ? [] : items;
  const chips = shown.filter((s) => s.type !== "product");
  const products = shown.filter((s) => s.type === "product");
  const navigable = [...chips, ...products];

  const go = (href: string, label?: string) => {
    if (label) saveRecent(label);
    setOpen(false);
    input.current?.blur();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(navigable.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === "Enter" && active >= 0 && navigable[active]) {
      e.preventDefault();
      go(navigable[active].href, query);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapper} className={cn("relative", className)}>
      <Form
        action="/search"
        onSubmit={(e) => {
          if (!query) {
            e.preventDefault();
            return;
          }
          saveRecent(query);
          setOpen(false);
          input.current?.blur();
        }}
        className="relative"
        role="search"
      >
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-fg-subtle" />
        <input
          ref={input}
          name="q"
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setRecent(readRecent());
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={t("common.searchPlaceholder")}
          autoComplete="off"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label={t("common.search")}
          className="h-11 w-full rounded-full border border-line bg-muted pl-11 pr-24 text-sm text-fg placeholder:text-fg-subtle focus:border-primary-500 focus:bg-surface focus:outline-none focus:ring-3 focus:ring-primary/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {q ? (
          <button type="button" onClick={() => { setQ(""); input.current?.focus(); }} className="absolute right-[4.75rem] top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-fg-subtle hover:bg-line" aria-label={t("common.clear")}>
            <Icon name="x" className="size-4" />
          </button>
        ) : null}
        <button type="submit" className="absolute right-1 top-1 h-9 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-700">
          {t("common.search")}
        </button>
      </Form>

      {open ? (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-[70vh] animate-pop overflow-y-auto rounded-2xl border border-line bg-surface p-3 shadow-pop">
          {tooShort ? (
            <div className="space-y-4 p-1">
              {recent.length ? (
                <div>
                  <p className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                    {t("header.recent")}
                    <button type="button" className="normal-case text-primary-600 hover:underline" onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}>
                      {t("common.clear")}
                    </button>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button key={r} type="button" onClick={() => go(routes.search(r), r)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-fg hover:border-primary-300 hover:bg-muted">
                        <Icon name="clock" className="size-3.5 text-fg-subtle" />
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-subtle">{t("header.trending")}</p>
                <div className="flex flex-wrap gap-2">
                  {catalogConfig.search.trendingQueries.map((r) => (
                    <button key={r} type="button" onClick={() => go(routes.search(r), r)} className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary/15 dark:text-primary-300">
                      <Icon name="trending-up" className="size-3.5" />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : loading && !shown.length ? (
            <p className="flex items-center gap-2 p-3 text-sm text-fg-muted">
              <Icon name="loader" className="size-4 animate-spin" /> {t("common.loading")}
            </p>
          ) : !shown.length ? (
            <p className="p-3 text-sm text-fg-muted">
              {t("common.noResults")} for “{query}”. <Link href={routes.search(query)} className="font-semibold text-primary-600 hover:underline" onClick={() => setOpen(false)}>Search all products</Link>
            </p>
          ) : (
            <>
              {chips.length ? (
                <div className="mb-2 flex flex-wrap gap-2 border-b border-line pb-3">
                  {chips.map((s, i) => (
                    <button
                      key={`${s.type}-${s.id}`}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={active === i}
                      type="button"
                      onClick={() => go(s.href, query)}
                      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm", active === i ? "border-primary-500 bg-primary/10" : "border-line hover:bg-muted")}
                    >
                      <Icon name={typeIcon[s.type]} className="size-3.5 text-primary-600" />
                      <span className="font-medium text-fg">{s.label}</span>
                      {s.sublabel ? <span className="text-xs text-fg-subtle">{s.sublabel}</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
              <ul>
                {products.map((s, j) => {
                  const i = chips.length + j;
                  return (
                    <li key={`${s.type}-${s.id}`}>
                      <button
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={active === i}
                        type="button"
                        onClick={() => go(s.href, query)}
                        onMouseEnter={() => setActive(i)}
                        className={cn("flex w-full items-center gap-3 rounded-xl p-2 text-left", active === i ? "bg-muted" : "")}
                      >
                        <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: s.art ? productArtSvg(s.art) : "" }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-fg">{s.label}</span>
                          {s.sublabel ? <span className="block truncate text-xs text-fg-muted">{s.sublabel}</span> : null}
                        </span>
                        {s.price !== undefined ? (
                          <span className="shrink-0 text-right">
                            <span className="block text-sm font-bold text-fg">{formatPrice(s.price)}</span>
                            {s.mrp && s.mrp > s.price ? <del className="block text-xs text-fg-subtle">{formatPrice(s.mrp)}</del> : null}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <Link href={routes.search(query)} onClick={() => { saveRecent(query); setOpen(false); }} className="mt-2 flex items-center justify-center gap-1 rounded-xl bg-muted p-2.5 text-sm font-semibold text-primary-700 hover:bg-primary/10 dark:text-primary-300">
                See all results for “{query}” <Icon name="arrow-right" className="size-4" />
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
