"use client";

import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { applyUiSettings, settingsMaps } from "@/lib/theme/theme-css";
import { persistedStores } from "@/stores";
import { useSettingsStore } from "@/stores/settings-store";
import { Toaster } from "@/components/ui/toaster";

const maps = settingsMaps();
// useLayoutEffect warns during SSR; this component only runs its effects in the browser.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Client-side glue:
 *  - rehydrates persisted stores after mount (so SSR and first render match)
 *  - keeps <html> attributes in sync with display settings
 *  - follows the OS colour scheme when mode is "system"
 *  - syncs stores across tabs through the `storage` event
 */
export function AppProviders({ children }: { children: ReactNode }) {
  useIsoLayoutEffect(() => {
    for (const store of persistedStores) void store.persist.rehydrate();
    // React may reset <html> attributes on a dev remount; re-apply the saved settings.
    applyUiSettings(useSettingsStore.getState().settings, maps);
    return useSettingsStore.subscribe((s, prev) => {
      if (s.settings !== prev.settings) applyUiSettings(s.settings, maps);
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      const { settings } = useSettingsStore.getState();
      if (settings.mode === "system") applyUiSettings(settings, maps);
    };
    media.addEventListener("change", onScheme);

    const onStorage = (e: StorageEvent) => {
      const store = persistedStores.find((s) => s.persist.getOptions().name === e.key);
      if (store) void store.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", onScheme);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
