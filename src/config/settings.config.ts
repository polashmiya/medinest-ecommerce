import { catalogConfig } from "./catalog.config";
import { themeConfig, type ThemeMode } from "./theme.config";
import { defaultLocale, type Locale } from "./labels.config";

export type CardSize = "compact" | "comfortable" | "large";
export type CardStyle = "bordered" | "elevated" | "flat";
export type CartWidth = "sm" | "md" | "lg";
export type ListingView = "grid" | "list";

/**
 * User-adjustable UI settings (persisted in localStorage). The defaults come
 * from theme/catalog config so a rebrand only needs to touch those files.
 */
export interface UiSettings {
  mode: ThemeMode;
  colorPreset: string;
  font: string;
  fontScale: string;
  radius: string;
  density: string;
  cardSize: CardSize;
  cardStyle: CardStyle;
  cartWidth: CartWidth;
  containerWidth: string;
  stickyHeader: boolean;
  listingView: ListingView;
  locale: Locale;
  reduceMotion: boolean;
}

export const cartWidthOptions = [
  { id: "sm", label: "Narrow", value: "360px" },
  { id: "md", label: "Default", value: "440px" },
  { id: "lg", label: "Wide", value: "560px" },
] as const;

export const cardStyleOptions = [
  { id: "bordered", label: "Bordered" },
  { id: "elevated", label: "Elevated" },
  { id: "flat", label: "Flat" },
] as const;

/**
 * Version of the saved-settings format. Bump it when a default changes and
 * list the old value in `legacyDefaults`, so browsers that saved the old
 * default pick up the new one (explicit, different choices are kept).
 */
export const settingsVersion = 2;

export const legacyDefaults: { version: number; key: keyof UiSettings; value: UiSettings[keyof UiSettings] }[] = [
  // v2: default accent changed from Indigo Mint to Teal Coral.
  { version: 2, key: "colorPreset", value: "indigo" },
];

/** Drop saved values that were only ever the old default. Shared by the store and the boot script. */
export function migrateSettings(saved: Partial<UiSettings>, fromVersion: number): Partial<UiSettings> {
  const out: Partial<UiSettings> = { ...saved };
  for (const l of legacyDefaults) if (fromVersion < l.version && out[l.key] === l.value) delete out[l.key];
  return out;
}

export const defaultUiSettings: UiSettings = {
  mode: themeConfig.defaultMode,
  colorPreset: themeConfig.defaultColorPreset,
  font: themeConfig.defaultFont,
  fontScale: themeConfig.defaultFontScale,
  radius: themeConfig.defaultRadius,
  density: themeConfig.defaultDensity,
  cardSize: catalogConfig.card.defaultSize,
  cardStyle: "bordered",
  cartWidth: "md",
  containerWidth: themeConfig.defaultContainerWidth,
  stickyHeader: true,
  listingView: "grid",
  locale: defaultLocale,
  reduceMotion: false,
};
