"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { routes } from "@/lib/routes";
import { Input } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";

export interface BrandEntry {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

const letterOf = (name: string) => {
  const c = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
};

/** A–Z brand index with instant filtering. Server-rendered, so every link is crawlable. */
export function BrandDirectory({ brands }: { brands: BrandEntry[] }) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const map = new Map<string, BrandEntry[]>();
    for (const b of [...brands].sort((a, b) => a.name.localeCompare(b.name))) {
      if (needle && !b.name.toLowerCase().includes(needle)) continue;
      const l = letterOf(b.name);
      map.set(l, [...(map.get(l) ?? []), b]);
    }
    return [...map.entries()].sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)));
  }, [brands, q]);

  return (
    <div>
      <div className="sticky top-32 z-10 -mx-1 mb-6 flex flex-col gap-3 bg-bg/90 px-1 py-2 backdrop-blur md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${brands.length} brands`} className="h-10 pl-9" aria-label="Filter brands" />
        </div>
        <nav aria-label="Jump to letter" className="no-scrollbar flex gap-1 overflow-x-auto">
          {groups.map(([letter]) => (
            <a key={letter} href={`#brands-${letter}`} className="grid size-8 shrink-0 place-items-center rounded-md text-xs font-bold text-fg-muted hover:bg-primary/10 hover:text-primary-700">
              {letter}
            </a>
          ))}
        </nav>
      </div>
      {groups.length ? (
        <div className="space-y-8">
          {groups.map(([letter, list]) => (
            <section key={letter} id={`brands-${letter}`} className="scroll-mt-48">
              <h2 className="mb-3 flex items-center gap-3 text-lg font-extrabold text-fg">
                <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-fg">{letter}</span>
                <span className="text-sm font-medium text-fg-subtle">{list.length} brands</span>
              </h2>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((b) => (
                  <li key={b.id}>
                    <Link href={routes.brand(b.slug)} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm text-fg hover:bg-muted hover:text-primary-700">
                      <span className="truncate">{b.name}</span>
                      <span className="shrink-0 text-xs text-fg-subtle">{b.productCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-fg-muted">No brands match “{q}”.</p>
      )}
    </div>
  );
}
