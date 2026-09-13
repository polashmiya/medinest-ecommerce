/**
 * Design tokens. Colors are expressed as OKLCH triplets so Tailwind utilities
 * such as `bg-primary/20` keep working with alpha. Every preset generates the
 * same set of CSS variables; the active preset is chosen via `data-color` on <html>.
 */

export type ColorScale = {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string; 950: string;
};

export interface ColorPreset {
  id: string;
  label: string;
  /** Swatch shown in the settings panel */
  swatch: string;
  primary: ColorScale;
  accent: ColorScale;
}

const scale = (v: Record<number, string>) => v as ColorScale;

export const colorPresets: ColorPreset[] = [
  {
    id: "indigo",
    label: "Indigo Mint",
    swatch: "#4f46e5",
    primary: scale({ 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81", 950: "#1e1b4b" }),
    accent: scale({ 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b", 950: "#022c22" }),
  },
  {
    id: "teal",
    label: "Teal Coral",
    swatch: "#0d9488",
    primary: scale({ 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a", 950: "#042f2e" }),
    accent: scale({ 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337", 950: "#4c0519" }),
  },
  {
    id: "blue",
    label: "Ocean Blue",
    swatch: "#2563eb",
    primary: scale({ 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a", 950: "#172554" }),
    accent: scale({ 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03" }),
  },
  {
    id: "violet",
    label: "Violet Lime",
    swatch: "#7c3aed",
    primary: scale({ 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95", 950: "#2e1065" }),
    accent: scale({ 50: "#f7fee7", 100: "#ecfccb", 200: "#d9f99d", 300: "#bef264", 400: "#a3e635", 500: "#84cc16", 600: "#65a30d", 700: "#4d7c0f", 800: "#3f6212", 900: "#365314", 950: "#1a2e05" }),
  },
  {
    id: "rose",
    label: "Rose Sky",
    swatch: "#e11d48",
    primary: scale({ 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337", 950: "#4c0519" }),
    accent: scale({ 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e", 950: "#082f49" }),
  },
  {
    id: "emerald",
    label: "Emerald Amber",
    swatch: "#059669",
    primary: scale({ 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b", 950: "#022c22" }),
    accent: scale({ 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03" }),
  },
];

export interface FontOption {
  id: string;
  label: string;
  /** CSS variable created by next/font in the root layout */
  cssVar: string;
}

export const fontOptions: FontOption[] = [
  { id: "jakarta", label: "Plus Jakarta Sans", cssVar: "--font-jakarta" },
  { id: "inter", label: "Inter", cssVar: "--font-inter" },
  { id: "manrope", label: "Manrope", cssVar: "--font-manrope" },
  { id: "dmsans", label: "DM Sans", cssVar: "--font-dmsans" },
  { id: "roboto", label: "Roboto", cssVar: "--font-roboto" },
];

export const themeConfig = {
  /** Accent preset for first-time visitors; users can switch in Display settings. */
  defaultColorPreset: "teal",
  defaultFont: "jakarta",
  defaultMode: "system" as "light" | "dark" | "system",
  /** Base font-size scale options (percent of 16px). */
  fontScales: [
    { id: "sm", label: "Small", value: 93.75 },
    { id: "md", label: "Default", value: 100 },
    { id: "lg", label: "Large", value: 106.25 },
    { id: "xl", label: "Extra large", value: 112.5 },
  ],
  defaultFontScale: "md",
  radii: [
    { id: "none", label: "Square", value: "0px" },
    { id: "sm", label: "Subtle", value: "6px" },
    { id: "md", label: "Rounded", value: "12px" },
    { id: "lg", label: "Pill", value: "20px" },
  ],
  defaultRadius: "md",
  densities: [
    { id: "compact", label: "Compact", value: 0.85 },
    { id: "comfortable", label: "Comfortable", value: 1 },
    { id: "spacious", label: "Spacious", value: 1.15 },
  ],
  defaultDensity: "comfortable",
  /** Max content width for the boxed layout. */
  containerWidths: [
    { id: "narrow", label: "Narrow", value: "1200px" },
    { id: "default", label: "Default", value: "1360px" },
    { id: "wide", label: "Wide", value: "1600px" },
    { id: "full", label: "Full width", value: "100%" },
  ],
  defaultContainerWidth: "default",
  /** Tailwind-compatible breakpoints. Mirrored into CSS in globals.css via @theme. */
  breakpoints: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
  /** Semantic surface colours per mode. */
  surfaces: {
    light: {
      bg: "#f6f7fb", surface: "#ffffff", surfaceMuted: "#f1f3f9", border: "#e5e7ef",
      text: "#0f172a", textMuted: "#5b6478", textSubtle: "#8a93a6",
    },
    dark: {
      bg: "#0b1020", surface: "#131a2e", surfaceMuted: "#1a2238", border: "#26304a",
      text: "#eef2ff", textMuted: "#aab3c8", textSubtle: "#7b859c",
    },
  },
  status: {
    success: "#16a34a", warning: "#f59e0b", danger: "#dc2626", info: "#0284c7", rx: "#7c3aed", discount: "#e11d48",
  },
} as const;

export type ThemeMode = "light" | "dark" | "system";
