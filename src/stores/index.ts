"use client";

import { useEffect, useState } from "react";
import { useAddressStore, useAuthStore, useNotificationStore, usePrescriptionStore, useRecentStore, useReviewStore, useStockRequestStore, useWishlistStore } from "./account-store";
import { useCartStore } from "./cart-store";
import { useOrderStore } from "./order-store";
import { useSettingsStore } from "./settings-store";
import { useDeliveryStore } from "./ui-store";

export * from "./account-store";
export * from "./cart-store";
export * from "./order-store";
export * from "./settings-store";
export * from "./toast-store";
export * from "./ui-store";

/** Every persisted store, rehydrated together after mount. */
export const persistedStores = [
  useSettingsStore, useCartStore, useDeliveryStore, useWishlistStore, useRecentStore, useAuthStore,
  useAddressStore, usePrescriptionStore, useNotificationStore, useReviewStore, useStockRequestStore, useOrderStore,
] as const;

// On the server there is no localStorage, so zustand omits the `persist` API entirely.
const allHydrated = () => typeof window !== "undefined" && persistedStores.every((s) => s.persist?.hasHydrated());

/** True once persisted stores have loaded from localStorage (always false during SSR). */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(allHydrated);
  useEffect(() => {
    if (hydrated) return;
    const check = () => allHydrated() && setHydrated(true);
    const unsubs = persistedStores.map((s) => s.persist?.onFinishHydration(check));
    check();
    return () => unsubs.forEach((u) => u?.());
  }, [hydrated]);
  return hydrated;
}
