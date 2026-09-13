"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

function useOverlayBehaviour(open: boolean, onClose: () => void, panel: React.RefObject<HTMLElement | null>) {
  // Keep the latest onClose without re-running the effect (callers often pass inline arrows;
  // re-running would steal focus from inputs on every re-render).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const focusables = () =>
      panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])') ?? [];
    requestAnimationFrame(() => (panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current)?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key !== "Tab") return;
      const items = [...focusables()];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previous?.focus?.();
    };
  }, [open, panel]);
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Hide the visual header (title still announced to screen readers). */
  bare?: boolean;
}

/** Slide-in side sheet. `side="right"` uses the user's cart-width setting. */
export function Drawer({ open, onClose, title, children, footer, className, side = "right", bare }: OverlayProps & { side?: "left" | "right" | "bottom" }) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayBehaviour(open, onClose, panel);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col bg-surface shadow-pop outline-none",
          side === "right" && "inset-y-0 right-0 w-[min(var(--cart-width,440px),100vw)] animate-slide-in-right",
          side === "left" && "inset-y-0 left-0 w-[min(340px,88vw)] animate-slide-in-left",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[88dvh] animate-pop rounded-t-2xl pb-[env(safe-area-inset-bottom)]",
          className,
        )}
      >
        {side === "bottom" ? <div className="sheet-handle" aria-hidden /> : null}
        <div className={cn("flex items-center justify-between gap-3 border-b border-line px-5 py-3.5", bare && "sr-only")}>
          <h2 id={titleId} className="text-base font-bold text-fg">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-fg-muted hover:bg-muted hover:text-fg" aria-label="Close">
            <Icon name="x" className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer ? <div className="border-t border-line bg-surface px-5 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

/** Centred dialog. */
export function Modal({ open, onClose, title, children, footer, className }: OverlayProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayBehaviour(open, onClose, panel);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto p-4">
      <div className="fixed inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={cn("relative w-full max-w-lg animate-pop rounded-2xl bg-surface shadow-pop outline-none", className)}>
        <div className="flex items-center justify-between gap-3 px-6 pt-5">
          <h2 id={titleId} className="text-lg font-bold text-fg">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-fg-muted hover:bg-muted" aria-label="Close">
            <Icon name="x" className="size-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
