"use client";

import type { ReactNode } from "react";
import { catalogConfig } from "@/config/catalog.config";
import { features } from "@/config/features.config";
import { supportedLocales } from "@/config/labels.config";
import { cardStyleOptions, cartWidthOptions, type UiSettings } from "@/config/settings.config";
import { colorPresets, fontOptions, themeConfig } from "@/config/theme.config";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { useSettingsStore, useUiStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Drawer } from "@/components/ui/overlay";

function Group({ title, icon, children }: { title: string; icon: IconName; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line px-5 py-4 last:border-0">
      <legend className="float-left mb-3 flex w-full items-center gap-2 text-sm font-bold text-fg">
        <Icon name={icon} className="size-4 text-primary-600" />
        {title}
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

/** Segmented control for a small set of options. */
function Segmented<T extends string>({ value, options, onChange, name }: { value: T; options: readonly { id: T | string; label: string; icon?: IconName }[]; onChange: (v: T) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-1 rounded-xl bg-muted p-1" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id as T)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition",
            value === o.id ? "bg-surface text-primary-700 shadow-sm dark:text-primary-300" : "text-fg-muted hover:text-fg",
          )}
        >
          {o.icon ? <Icon name={o.icon} className="size-4" /> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-1.5">
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        {hint ? <span className="block text-xs text-fg-subtle">{hint}</span> : null}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-line transition peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary-500 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" aria-hidden />
    </label>
  );
}

/**
 * Display settings drawer: theme mode, accent colour, font, text size, corner
 * radius, density, product card size & style, cart width, page width, sticky
 * header, list/grid view, language and reduced motion. Saved on the device.
 */
export function SettingsPanel() {
  const t = useT();
  const panel = useUiStore((s) => s.panel);
  const close = useUiStore((s) => s.close);
  const settings = useSettingsStore((s) => s.settings);
  const set = useSettingsStore((s) => s.set);
  const reset = useSettingsStore((s) => s.reset);
  const change = <K extends keyof UiSettings>(k: K) => (v: UiSettings[K]) => set(k, v);

  return (
    <Drawer
      open={panel === "settings"}
      onClose={close}
      title={
        <span className="flex items-center gap-2">
          <Icon name="palette" className="size-5 text-primary-600" /> {t("settings.title")}
        </span>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-fg-subtle">{t("settings.hint")}</p>
          <Button variant="outline" size="sm" onClick={reset}>
            <Icon name="rotate-ccw" className="size-4" /> {t("settings.reset")}
          </Button>
        </div>
      }
    >
      {features.darkMode ? (
        <Group title={t("settings.mode")} icon="sun">
          <Segmented
            name={t("settings.mode")}
            value={settings.mode}
            onChange={change("mode")}
            options={[
              { id: "light", label: t("settings.light"), icon: "sun" },
              { id: "dark", label: t("settings.dark"), icon: "moon" },
              { id: "system", label: t("settings.system"), icon: "monitor" },
            ]}
          />
        </Group>
      ) : null}

      <Group title={t("settings.color")} icon="palette">
        <div role="radiogroup" aria-label={t("settings.color")} className="grid grid-cols-3 gap-2">
          {colorPresets.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={settings.colorPreset === p.id}
              onClick={() => set("colorPreset", p.id)}
              className={cn("flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-semibold transition", settings.colorPreset === p.id ? "border-primary-500 ring-2 ring-primary/20" : "border-line hover:border-primary-300")}
            >
              <span className="flex shrink-0 -space-x-1.5">
                <span className="size-5 rounded-full ring-2 ring-surface" style={{ background: p.primary[600] }} />
                <span className="size-5 rounded-full ring-2 ring-surface" style={{ background: p.accent[500] }} />
              </span>
              <span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title={t("settings.font")} icon="type">
        <div role="radiogroup" aria-label={t("settings.font")} className="grid grid-cols-2 gap-2">
          {fontOptions.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={settings.font === f.id}
              onClick={() => set("font", f.id)}
              style={{ fontFamily: `var(${f.cssVar})` }}
              className={cn("rounded-xl border px-3 py-2.5 text-left text-sm transition", settings.font === f.id ? "border-primary-500 ring-2 ring-primary/20" : "border-line hover:border-primary-300")}
            >
              <span className="block text-lg font-bold leading-none">Aa</span>
              <span className="mt-1 block truncate text-xs text-fg-muted">{f.label}</span>
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 text-xs font-semibold text-fg-muted">{t("settings.fontSize")}</p>
        <Segmented name={t("settings.fontSize")} value={settings.fontScale} onChange={change("fontScale")} options={themeConfig.fontScales} />
      </Group>

      <Group title="Layout" icon="layout-grid">
        <p className="mb-2 text-xs font-semibold text-fg-muted">{t("settings.cardSize")}</p>
        <Segmented name={t("settings.cardSize")} value={settings.cardSize} onChange={change("cardSize")} options={catalogConfig.card.sizes} />
        <p className="mb-2 mt-4 text-xs font-semibold text-fg-muted">Card style</p>
        <Segmented name="Card style" value={settings.cardStyle} onChange={change("cardStyle")} options={cardStyleOptions} />
        <p className="mb-2 mt-4 text-xs font-semibold text-fg-muted">Product listing</p>
        <Segmented
          name="Product listing"
          value={settings.listingView}
          onChange={change("listingView")}
          options={[
            { id: "grid", label: "Grid", icon: "layout-grid" },
            { id: "list", label: "List", icon: "list" },
          ]}
        />
        <p className="mb-2 mt-4 text-xs font-semibold text-fg-muted">{t("settings.cartWidth")}</p>
        <Segmented name={t("settings.cartWidth")} value={settings.cartWidth} onChange={change("cartWidth")} options={cartWidthOptions} />
        <p className="mb-2 mt-4 text-xs font-semibold text-fg-muted">{t("settings.container")}</p>
        <Segmented name={t("settings.container")} value={settings.containerWidth} onChange={change("containerWidth")} options={themeConfig.containerWidths} />
      </Group>

      <Group title="Shape & spacing" icon="sliders">
        <p className="mb-2 text-xs font-semibold text-fg-muted">{t("settings.radius")}</p>
        <Segmented name={t("settings.radius")} value={settings.radius} onChange={change("radius")} options={themeConfig.radii} />
        <p className="mb-2 mt-4 text-xs font-semibold text-fg-muted">{t("settings.density")}</p>
        <Segmented name={t("settings.density")} value={settings.density} onChange={change("density")} options={themeConfig.densities} />
      </Group>

      <Group title="Behaviour" icon="settings">
        <Toggle label="Sticky header" hint="Keep search and cart visible while scrolling" checked={settings.stickyHeader} onChange={change("stickyHeader")} />
        <Toggle label="Reduce motion" hint="Minimise animations and transitions" checked={settings.reduceMotion} onChange={change("reduceMotion")} />
      </Group>

      {features.languageSwitcher ? (
        <Group title={t("settings.language")} icon="languages">
          <Segmented name={t("settings.language")} value={settings.locale} onChange={change("locale")} options={supportedLocales.map((l) => ({ id: l.id, label: l.label }))} />
        </Group>
      ) : null}
    </Drawer>
  );
}
