"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartConfig, deliveryConfig } from "@/config/commerce.config";
import { persistOptions } from "./persist";

type Panel = "cart" | "settings" | "menu" | "filters" | "search" | "location" | null;

interface UiState {
  panel: Panel;
  open: (panel: Exclude<Panel, null>) => void;
  close: () => void;
  toggle: (panel: Exclude<Panel, null>) => void;
}

/** Transient UI state: which overlay (drawer / sheet) is open. Only one at a time. */
export const useUiStore = create<UiState>()((set) => ({
  panel: null,
  open: (panel) => set({ panel }),
  close: () => set({ panel: null }),
  toggle: (panel) => set((s) => ({ panel: s.panel === panel ? null : panel })),
}));

interface DeliveryState {
  district: string;
  zoneId: string;
  setDistrict: (district: string, zoneId: string) => void;
}

/** The customer's delivery area; drives fees, ETAs and cold-chain rules. */
export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      district: "Dhaka",
      zoneId: deliveryConfig.defaultZoneId,
      setDistrict: (district, zoneId) => set({ district, zoneId }),
    }),
    persistOptions<DeliveryState>(cartConfig.storageKeys.delivery, (s) => ({ district: s.district, zoneId: s.zoneId })),
  ),
);
