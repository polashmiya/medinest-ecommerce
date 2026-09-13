import { createJSONStorage, type PersistOptions } from "zustand/middleware";

/**
 * Shared persist options. Stores skip automatic hydration so the first client
 * render matches the server HTML; <StoreHydration/> rehydrates them after mount.
 */
export function persistOptions<S, P = Partial<S>>(name: string, partialize?: (s: S) => P, version = 1): PersistOptions<S, P> {
  return {
    name,
    version,
    skipHydration: true,
    storage: createJSONStorage(() => localStorage),
    ...(partialize ? { partialize } : {}),
  };
}
