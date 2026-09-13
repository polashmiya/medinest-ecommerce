"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartConfig, deliveryConfig, paymentConfig } from "@/config/commerce.config";
import { computeTotals, evaluateCoupon, lineKey, type CouponCheck } from "@/lib/cart";
import type { CartLine, ProductSummary } from "@/types";
import { persistOptions } from "./persist";
import { useDeliveryStore } from "./ui-store";

export type AddResult = { ok: true; qty: number } | { ok: false; reason: "stock" | "max" | "lines" };

interface CartState {
  lines: CartLine[];
  couponCode: string | null;
  deliveryOptionId: string;
  paymentMethodId: string;
  add: (product: ProductSummary, qty?: number) => AddResult;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => CouponCheck;
  removeCoupon: () => void;
  setDeliveryOption: (id: string) => void;
  setPaymentMethod: (id: string) => void;
}

const maxFor = (p: ProductSummary) => Math.min(p.maxQty || cartConfig.defaultMaxQty, cartConfig.defaultMaxQty * 10);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      couponCode: null,
      deliveryOptionId: deliveryConfig.options[0].id,
      paymentMethodId: paymentConfig.defaultMethod,

      add: (product, qty = 1) => {
        if (!product.inStock) return { ok: false, reason: "stock" };
        const key = lineKey(product.id, product.variantId);
        const lines = get().lines;
        const existing = lines.find((l) => l.key === key);
        const max = maxFor(product);
        if (existing) {
          if (existing.qty >= max) return { ok: false, reason: "max" };
          const next = Math.min(max, existing.qty + qty);
          set({ lines: lines.map((l) => (l.key === key ? { ...l, qty: next, snapshot: product } : l)) });
          return { ok: true, qty: next };
        }
        if (lines.length >= cartConfig.maxLines) return { ok: false, reason: "lines" };
        const line: CartLine = { key, productId: product.id, variantId: product.variantId, qty: Math.min(max, qty), snapshot: product, addedAt: new Date().toISOString() };
        set({ lines: [line, ...lines] });
        return { ok: true, qty: line.qty };
      },

      setQty: (key, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => l.key !== key) : s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, maxFor(l.snapshot)) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [], couponCode: null }),

      applyCoupon: (code) => {
        const { lines } = get();
        const subtotal = lines.reduce((s, l) => s + l.snapshot.price * l.qty, 0);
        const check = evaluateCoupon(code, lines, subtotal);
        if (check.ok) set({ couponCode: check.coupon.code });
        return check;
      },
      removeCoupon: () => set({ couponCode: null }),
      setDeliveryOption: (id) => set({ deliveryOptionId: id }),
      setPaymentMethod: (id) => set({ paymentMethodId: id }),
    }),
    persistOptions<CartState>(cartConfig.storageKeys.cart, (s) => ({
      lines: s.lines,
      couponCode: s.couponCode,
      deliveryOptionId: s.deliveryOptionId,
      paymentMethodId: s.paymentMethodId,
    })),
  ),
);

/** Cart totals for the current delivery zone. */
export function useCartTotals() {
  const lines = useCartStore((s) => s.lines);
  const couponCode = useCartStore((s) => s.couponCode);
  const deliveryOptionId = useCartStore((s) => s.deliveryOptionId);
  const paymentMethodId = useCartStore((s) => s.paymentMethodId);
  const zoneId = useDeliveryStore((s) => s.zoneId);
  return useMemo(
    () => computeTotals({ lines, couponCode, zoneId, deliveryOptionId, paymentMethodId }),
    [lines, couponCode, zoneId, deliveryOptionId, paymentMethodId],
  );
}

export const useCartCount = () => useCartStore((s) => s.lines.reduce((n, l) => n + l.qty, 0));
export const useLineQty = (productId: number, variantId: number) =>
  useCartStore((s) => s.lines.find((l) => l.key === lineKey(productId, variantId))?.qty ?? 0);
