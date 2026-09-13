"use client";

import { useCallback } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { translate, type LabelKey, type LabelVars } from "./i18n";

/** Client-side translator bound to the user's chosen locale. */
export function useT() {
  const locale = useSettingsStore((s) => s.settings.locale);
  return useCallback((key: LabelKey, vars?: LabelVars) => translate(locale, key, vars), [locale]);
}
