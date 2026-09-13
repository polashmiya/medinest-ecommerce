"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/**
 * Horizontal scroller with prev/next buttons. Children are rendered on the
 * server; this wrapper only adds scroll behaviour.
 */
export function Rail({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  const btn = "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-fg shadow-card transition hover:bg-muted md:grid";

  return (
    <div className={cn("relative", className)}>
      <div ref={ref} role="region" aria-label={label} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-2 md:gap-4">
        {children}
      </div>
      {!edges.start ? (
        <button type="button" className={cn(btn, "-left-4")} onClick={() => scroll(-1)} aria-label="Scroll left">
          <Icon name="chevron-left" className="size-5" />
        </button>
      ) : null}
      {!edges.end ? (
        <button type="button" className={cn(btn, "-right-4")} onClick={() => scroll(1)} aria-label="Scroll right">
          <Icon name="chevron-right" className="size-5" />
        </button>
      ) : null}
    </div>
  );
}
