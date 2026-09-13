"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartConfig } from "@/config/commerce.config";
import { defaultUiSettings, migrateSettings, settingsVersion, type UiSettings } from "@/config/settings.config";
import { persistOptions } from "./persist";

interface SettingsState {
  settings: UiSettings;
  set: <K extends keyof UiSettings>(key: K, value: UiSettings[K]) => void;
  reset: () => void;
}

type Saved = { settings?: Partial<UiSettings> } | undefined;

/** Display preferences. Persisted shape `{ state: { settings } }` is read by the boot script. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultUiSettings,
      set: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
      reset: () => set({ settings: defaultUiSettings }),
    }),
    {
      ...persistOptions<SettingsState, { settings: UiSettings }>(cartConfig.storageKeys.settings, (s) => ({ settings: s.settings }), settingsVersion),
      migrate: (persisted, version) => ({ settings: migrateSettings((persisted as Saved)?.settings ?? {}, version) }) as { settings: UiSettings },
      merge: (persisted, current) => ({
        ...current,
        settings: { ...defaultUiSettings, ...((persisted as Saved)?.settings ?? {}) },
      }),
    },
  ),
);

export const useSetting = <K extends keyof UiSettings>(key: K) => useSettingsStore((s) => s.settings[key]);
