import { labels, defaultLocale, type Locale } from "@/config/labels.config";

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends readonly unknown[]
      ? never
      : T[K] extends object
        ? Leaves<T[K], `${P}${K}.`>
        : never;
}[keyof T & string];

export type LabelKey = Leaves<(typeof labels)["en"]>;
export type LabelVars = Record<string, string | number>;

function lookup(dict: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined), dict);
}

export function interpolate(template: string, vars?: LabelVars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

export function translate(locale: Locale, key: LabelKey, vars?: LabelVars): string {
  const value = lookup(labels[locale], key) ?? lookup(labels.en, key);
  return typeof value === "string" ? interpolate(value, vars) : key;
}

/** Raw (non-string) label value, e.g. arrays or maps. */
export function labelValue<T = unknown>(key: string, locale: Locale = defaultLocale): T {
  return (lookup(labels[locale], key) ?? lookup(labels.en, key)) as T;
}

/** Server-side translator (default locale). */
export const t = (key: LabelKey, vars?: LabelVars) => translate(defaultLocale, key, vars);
