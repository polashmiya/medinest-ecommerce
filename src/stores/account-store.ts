"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartConfig } from "@/config/commerce.config";
import { uid } from "@/lib/utils";
import type { Address, Notification, Prescription, ProductSummary, Review, User } from "@/types";
import { persistOptions } from "./persist";

const keys = cartConfig.storageKeys;

/* ----------------------------- Wishlist ----------------------------- */

interface WishlistState {
  items: ProductSummary[];
  toggle: (p: ProductSummary) => boolean;
  remove: (id: number) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (p) => {
        const exists = get().items.some((x) => x.id === p.id);
        set({ items: exists ? get().items.filter((x) => x.id !== p.id) : [p, ...get().items] });
        return !exists;
      },
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    persistOptions<WishlistState>(keys.wishlist, (s) => ({ items: s.items })),
  ),
);

export const useIsWishlisted = (id: number) => useWishlistStore((s) => s.items.some((x) => x.id === id));

/* -------------------------- Recently viewed -------------------------- */

interface RecentState {
  items: ProductSummary[];
  push: (p: ProductSummary) => void;
  clear: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      push: (p) => set((s) => ({ items: [p, ...s.items.filter((x) => x.id !== p.id)].slice(0, cartConfig.recentLimit) })),
      clear: () => set({ items: [] }),
    }),
    persistOptions<RecentState>(keys.recent, (s) => ({ items: s.items })),
  ),
);

/* ------------------------------- Auth -------------------------------- */

interface AuthState {
  user: User | null;
  login: (phone: string, name?: string) => User;
  update: (patch: Partial<Pick<User, "name" | "email">>) => void;
  logout: () => void;
}

/**
 * Mock authentication (OTP is simulated in the login page). Replace `login`
 * with a call to your auth API; the rest of the UI only reads `user`.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (phone, name) => {
        const existing = get().user;
        const user: User =
          existing && existing.phone === phone
            ? existing
            : {
                id: uid("U"),
                phone,
                name: name?.trim() || "",
                createdAt: new Date().toISOString(),
                cashBalance: 0,
                referralCode: `MN${phone.slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
              };
        set({ user });
        return user;
      },
      update: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      logout: () => set({ user: null }),
    }),
    persistOptions<AuthState>(keys.auth, (s) => ({ user: s.user })),
  ),
);

/* ----------------------------- Addresses ----------------------------- */

interface AddressState {
  items: Address[];
  save: (a: Omit<Address, "id"> & { id?: string }) => Address;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      items: [],
      save: (input) => {
        const address: Address = { ...input, id: input.id ?? uid("A") };
        let items = get().items.some((a) => a.id === address.id)
          ? get().items.map((a) => (a.id === address.id ? address : a))
          : [...get().items, address];
        if (address.isDefault || items.length === 1) items = items.map((a) => ({ ...a, isDefault: a.id === address.id }));
        set({ items });
        return address;
      },
      remove: (id) =>
        set((s) => {
          const items = s.items.filter((a) => a.id !== id);
          if (items.length && !items.some((a) => a.isDefault)) items[0] = { ...items[0], isDefault: true };
          return { items };
        }),
      setDefault: (id) => set((s) => ({ items: s.items.map((a) => ({ ...a, isDefault: a.id === id })) })),
    }),
    persistOptions<AddressState>(keys.addresses, (s) => ({ items: s.items })),
  ),
);

/* --------------------------- Prescriptions --------------------------- */

interface PrescriptionState {
  items: Prescription[];
  add: (p: Omit<Prescription, "id" | "createdAt" | "status">) => Prescription;
  remove: (id: string) => void;
}

export const usePrescriptionStore = create<PrescriptionState>()(
  persist(
    (set) => ({
      items: [],
      add: (input) => {
        const p: Prescription = { ...input, id: uid("RX"), createdAt: new Date().toISOString(), status: "pending" };
        set((s) => ({ items: [p, ...s.items] }));
        return p;
      },
      remove: (id) => set((s) => ({ items: s.items.filter((p) => p.id !== id) })),
    }),
    persistOptions<PrescriptionState>(keys.prescriptions, (s) => ({ items: s.items })),
  ),
);

/* --------------------------- Notifications --------------------------- */

interface NotificationState {
  items: Notification[];
  push: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      items: [],
      push: (n) => set((s) => ({ items: [{ ...n, id: uid("N"), createdAt: new Date().toISOString(), read: false }, ...s.items].slice(0, 50) })),
      markRead: (id) => set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
      clear: () => set({ items: [] }),
    }),
    persistOptions<NotificationState>(keys.notifications, (s) => ({ items: s.items })),
  ),
);

/* ------------------------ Reviews & stock alerts ------------------------ */

interface ReviewState {
  items: Review[];
  add: (r: Omit<Review, "id" | "createdAt">) => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      items: [],
      add: (r) => set((s) => ({ items: [{ ...r, id: uid("R"), createdAt: new Date().toISOString() }, ...s.items] })),
    }),
    persistOptions<ReviewState>(keys.reviews, (s) => ({ items: s.items })),
  ),
);

interface StockRequestState {
  ids: number[];
  request: (id: number) => void;
}

export const useStockRequestStore = create<StockRequestState>()(
  persist(
    (set) => ({
      ids: [],
      request: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids : [...s.ids, id] })),
    }),
    persistOptions<StockRequestState>(keys.stockRequests, (s) => ({ ids: s.ids })),
  ),
);
