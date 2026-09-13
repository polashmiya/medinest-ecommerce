"use client";

import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores";
import { Icon } from "@/components/ui/icon";

/** Grid / list switch. Stored as a display setting and applied through a data attribute. */
export function ViewToggle() {
  const view = useSettingsStore((s) => s.settings.listingView);
  const set = useSettingsStore((s) => s.set);
  const btn = (active: boolean) => cn("grid size-9 place-items-center rounded-md", active ? "bg-surface text-primary-600 shadow-sm" : "text-fg-subtle hover:text-fg");
  return (
    <div className="hidden items-center gap-0.5 rounded-lg bg-muted p-0.5 sm:flex" role="group" aria-label="Layout">
      <button type="button" className={btn(view === "grid")} onClick={() => set("listingView", "grid")} aria-pressed={view === "grid"} aria-label="Grid view">
        <Icon name="layout-grid" className="size-4" />
      </button>
      <button type="button" className={btn(view === "list")} onClick={() => set("listingView", "list")} aria-pressed={view === "list"} aria-label="List view">
        <Icon name="list" className="size-4" />
      </button>
    </div>
  );
}
