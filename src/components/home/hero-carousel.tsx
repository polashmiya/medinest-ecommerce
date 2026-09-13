"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/**
 * Scroll-snap carousel. Slides are server-rendered children (their text stays
 * in the HTML); this component adds autoplay, dots and arrows. Autoplay pauses
 * on hover/focus and is disabled when the user prefers reduced motion.
 */
export function HeroCarousel({ children, interval }: { children: ReactNode; interval: number }) {
  const slides = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const n = slides.length;
    const next = ((i % n) + n) % n;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, [slides.length]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduce = document.documentElement.dataset.reduceMotion === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduce || slides.length < 2) return;
    const id = setTimeout(() => goTo(index + 1), interval);
    return () => clearTimeout(id);
  }, [index, paused, interval, goTo, slides.length]);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth">
        {slides.map((s, i) => (
          <div key={i} className="w-full shrink-0 snap-start" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`} aria-hidden={i !== index}>
            {s}
          </div>
        ))}
      </div>
      {slides.length > 1 ? (
        <>
          <button type="button" onClick={() => goTo(index - 1)} className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-slate-900 opacity-0 shadow transition group-hover:opacity-100 md:grid" aria-label="Previous slide">
            <Icon name="chevron-left" className="size-5" />
          </button>
          <button type="button" onClick={() => goTo(index + 1)} className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-slate-900 opacity-0 shadow transition group-hover:opacity-100 md:grid" aria-label="Next slide">
            <Icon name="chevron-right" className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button key={i} type="button" onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} aria-current={i === index} className={cn("h-2 rounded-full bg-white transition-all", i === index ? "w-6" : "w-2 opacity-50 hover:opacity-80")} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
