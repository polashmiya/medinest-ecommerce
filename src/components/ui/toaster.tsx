"use client";

import Link from "next/link";
import { useToastStore, type ToastTone } from "@/stores/toast-store";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";

const toneIcon: Record<ToastTone, IconName> = { default: "info", success: "circle-check", error: "warning", info: "info" };
const toneColor: Record<ToastTone, string> = { default: "text-primary-600", success: "text-success", error: "text-danger", info: "text-info" };

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6">
      {toasts.map((t) => (
        <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm animate-pop items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-pop">
          <Icon name={toneIcon[t.tone]} className={cn("mt-0.5 size-5 shrink-0", toneColor[t.tone])} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-fg">{t.title}</p>
            {t.description ? <p className="mt-0.5 line-clamp-2 text-xs text-fg-muted">{t.description}</p> : null}
          </div>
          {t.action ? (
            t.action.href ? (
              <Link href={t.action.href} onClick={() => dismiss(t.id)} className="shrink-0 text-sm font-bold text-primary-600 hover:underline dark:text-primary-300">
                {t.action.label}
              </Link>
            ) : (
              <button type="button" onClick={() => { t.action?.onClick?.(); dismiss(t.id); }} className="shrink-0 text-sm font-bold text-primary-600 hover:underline dark:text-primary-300">
                {t.action.label}
              </button>
            )
          ) : null}
          <button type="button" onClick={() => dismiss(t.id)} className="-m-1 grid size-7 shrink-0 place-items-center rounded-full text-fg-subtle hover:bg-muted" aria-label="Dismiss">
            <Icon name="x" className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
