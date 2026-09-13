"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUiStore } from "@/stores";
import { Icon } from "@/components/ui/icon";

/** App-style back arrow on inner pages (phones and small tablets only). */
export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/") return null;
  return (
    <button
      type="button"
      data-back-button
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      className="-ml-1 grid size-10 shrink-0 place-items-center rounded-full text-fg hover:bg-muted active:scale-95 md:hidden"
      aria-label="Go back"
    >
      <Icon name="arrow-left" className="size-5" />
    </button>
  );
}

const THRESHOLD = 140;
const DELTA = 8;

/**
 * On phones, slide the sticky header away while scrolling down and bring it
 * back on any upward scroll, like a native app bar. Drives the
 * `data-header-hidden` attribute that globals.css reacts to.
 */
export function HeaderAutoHide() {
  const panel = useUiStore((s) => s.panel);

  useEffect(() => {
    const root = document.documentElement;
    const mobile = window.matchMedia("(max-width: 767px)");
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (!mobile.matches || y < THRESHOLD) root.dataset.headerHidden = "false";
      else if (y - last > DELTA) root.dataset.headerHidden = "true";
      else if (last - y > DELTA) root.dataset.headerHidden = "false";
      if (Math.abs(y - last) > DELTA) last = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    mobile.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mobile.removeEventListener("change", update);
      root.dataset.headerHidden = "false";
    };
  }, []);

  // Always show the header while an overlay is open or after navigation.
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.dataset.headerHidden = "false";
  }, [panel, pathname]);

  return null;
}
