"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartConfig } from "@/config/commerce.config";
import type { Order, OrderStatus } from "@/types";
import { persistOptions } from "./persist";

interface OrderState {
  orders: Order[];
  place: (order: Omit<Order, "id" | "createdAt" | "status" | "timeline">) => Order;
  cancel: (id: string) => void;
}

function orderId() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `MN${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}${Math.floor(Math.random() * 9000 + 1000)}`;
}

/**
 * Mock order service. `place` would POST to the orders API; `cancel` would
 * call the cancellation endpoint. Status progression is simulated from the
 * order's age (see `orderProgress`) so the tracking UI has something to show.
 */
export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      place: (input) => {
        const now = new Date().toISOString();
        const order: Order = { ...input, id: orderId(), createdAt: now, status: "pending", timeline: [{ status: "pending", at: now }] };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      cancel: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status: "cancelled", timeline: [...o.timeline, { status: "cancelled", at: new Date().toISOString(), note: "Cancelled by customer" }] } : o,
          ),
        })),
    }),
    persistOptions<OrderState>(cartConfig.storageKeys.orders, (s) => ({ orders: s.orders })),
  ),
);

/** Simulated fulfilment steps: minutes after placement at which each status is reached. */
const STEPS: [OrderStatus, number][] = [
  ["pending", 0],
  ["confirmed", 2],
  ["processing", 10],
  ["shipped", 45],
  ["delivered", 240],
];

export const ORDER_FLOW: OrderStatus[] = STEPS.map(([s]) => s);

/** Current status and timeline of an order, derived from elapsed time for the demo. */
export function orderProgress(order: Order, now = Date.now()) {
  if (order.status === "cancelled") return { status: "cancelled" as OrderStatus, timeline: order.timeline };
  const placed = new Date(order.createdAt).getTime();
  const elapsedMin = (now - placed) / 60_000;
  const reached = STEPS.filter(([, min]) => elapsedMin >= min);
  const timeline = reached.map(([status, min]) => ({ status, at: new Date(placed + min * 60_000).toISOString() }));
  return { status: reached[reached.length - 1][0], timeline };
}

export const canCancel = (status: OrderStatus) => status === "pending" || status === "confirmed";
