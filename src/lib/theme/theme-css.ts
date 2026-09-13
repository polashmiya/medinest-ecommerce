import { colorPresets, fontOptions, themeConfig } from "@/config/theme.config";
import { catalogConfig } from "@/config/catalog.config";
import { cartWidthOptions, defaultUiSettings, legacyDefaults, type UiSettings } from "@/config/settings.config";

/**
 * Generates the CSS custom properties for every preset from the config so the
 * config file remains the single source of truth for design tokens.
 */
export function buildThemeCss() {
  const scaleVars = (prefix: string, scale: Record<string | number, string>) =>
    Object.entries(scale).map(([k, v]) => `--${prefix}-${k}:${v};`).join("");
  const surfaceVars = (s: Record<string, string>) =>
    `--bg:${s.bg};--surface:${s.surface};--surface-muted:${s.surfaceMuted};--border:${s.border};--text:${s.text};--text-muted:${s.textMuted};--text-subtle:${s.textSubtle};`;
  const status = Object.entries(themeConfig.status).map(([k, v]) => `--${k}:${v};`).join("");

  const def = colorPresets.find((p) => p.id === themeConfig.defaultColorPreset) ?? colorPresets[0];
  const defFont = fontOptions.find((f) => f.id === themeConfig.defaultFont) ?? fontOptions[0];
  const m = settingsMaps();

  let css = `:root{${scaleVars("p", def.primary)}${scaleVars("a", def.accent)}${surfaceVars(themeConfig.surfaces.light)}${status}` +
    `--app-font:var(${defFont.cssVar});--r:${m.radius[defaultUiSettings.radius]};--density:${m.density[defaultUiSettings.density]};` +
    `--font-scale:${m.fontScale[defaultUiSettings.fontScale]};--container-max:${m.container[defaultUiSettings.containerWidth]};` +
    `--cart-width:${m.cartWidth[defaultUiSettings.cartWidth]};--card-min:${m.cardMin[defaultUiSettings.cardSize]};` +
    `--card-aspect:${m.cardAspect[defaultUiSettings.cardSize]};color-scheme:light;}`;
  for (const p of colorPresets) css += `[data-color="${p.id}"]{${scaleVars("p", p.primary)}${scaleVars("a", p.accent)}}`;
  for (const f of fontOptions) css += `[data-font="${f.id}"]{--app-font:var(${f.cssVar});}`;
  css += `[data-mode="dark"]{${surfaceVars(themeConfig.surfaces.dark)}color-scheme:dark;}`;
  return css;
}

/** Option id → CSS value lookups shared by the inline boot script and the settings store. */
export function settingsMaps() {
  const toMap = <T extends { id: string }>(arr: readonly T[], val: (t: T) => string) => Object.fromEntries(arr.map((x) => [x.id, val(x)])) as Record<string, string>;
  return {
    fontScale: toMap(themeConfig.fontScales, (x) => `${x.value}%`),
    radius: toMap(themeConfig.radii, (x) => x.value),
    density: toMap(themeConfig.densities, (x) => String(x.value)),
    container: toMap(themeConfig.containerWidths, (x) => x.value),
    cartWidth: toMap(cartWidthOptions, (x) => x.value),
    cardMin: toMap(catalogConfig.card.sizes, (x) => `${x.minWidth}px`),
    cardAspect: toMap(catalogConfig.card.sizes, (x) => x.imageAspect),
  };
}

export type SettingsMaps = ReturnType<typeof settingsMaps>;

export function resolveMode(mode: UiSettings["mode"]) {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Applies UI settings to <html>. The same logic is serialised into the inline
 * boot script (see bootScript) so the first paint already matches the user's choice.
 */
export function applyUiSettings(s: UiSettings, maps: SettingsMaps, doc: Document = document) {
  const el = doc.documentElement;
  el.dataset.mode = resolveMode(s.mode);
  el.dataset.color = s.colorPreset;
  el.dataset.font = s.font;
  el.dataset.cardStyle = s.cardStyle;
  el.dataset.stickyHeader = String(s.stickyHeader);
  el.dataset.listingView = s.listingView;
  el.dataset.reduceMotion = String(s.reduceMotion);
  el.lang = s.locale;
  const st = el.style;
  st.setProperty("--font-scale", maps.fontScale[s.fontScale] ?? "100%");
  st.setProperty("--r", maps.radius[s.radius] ?? "12px");
  st.setProperty("--density", maps.density[s.density] ?? "1");
  st.setProperty("--container-max", maps.container[s.containerWidth] ?? "1360px");
  st.setProperty("--cart-width", maps.cartWidth[s.cartWidth] ?? "440px");
  st.setProperty("--card-min", maps.cardMin[s.cardSize] ?? "190px");
  st.setProperty("--card-aspect", maps.cardAspect[s.cardSize] ?? "1 / 1");
}

/**
 * Inline script executed before first paint. Reads persisted settings from
 * localStorage, applying the same legacy-default migration as the store
 * (see migrateSettings) so returning visitors don't flash an old default.
 */
export function bootScript(storageKey: string) {
  const maps = JSON.stringify(settingsMaps());
  const defaults = JSON.stringify(defaultUiSettings);
  const legacy = JSON.stringify(legacyDefaults);
  return `(function(){try{var m=${maps},d=${defaults},L=${legacy},s=d;var raw=localStorage.getItem(${JSON.stringify(storageKey)});if(raw){var p=JSON.parse(raw)||{},v=p.version||0,saved=Object.assign({},(p.state&&p.state.settings)||{});L.forEach(function(l){if(v<l.version&&saved[l.key]===l.value)delete saved[l.key];});s=Object.assign({},d,saved);}var e=document.documentElement;var mode=s.mode==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):s.mode;e.dataset.mode=mode;e.dataset.color=s.colorPreset;e.dataset.font=s.font;e.dataset.cardStyle=s.cardStyle;e.dataset.stickyHeader=String(!!s.stickyHeader);e.dataset.listingView=s.listingView;e.dataset.reduceMotion=String(!!s.reduceMotion);e.lang=s.locale;var st=e.style;st.setProperty("--font-scale",m.fontScale[s.fontScale]||"100%");st.setProperty("--r",m.radius[s.radius]||"12px");st.setProperty("--density",m.density[s.density]||"1");st.setProperty("--container-max",m.container[s.containerWidth]||"1360px");st.setProperty("--cart-width",m.cartWidth[s.cartWidth]||"440px");st.setProperty("--card-min",m.cardMin[s.cardSize]||"190px");st.setProperty("--card-aspect",m.cardAspect[s.cardSize]||"1 / 1");}catch(_){}})();`;
}
