"use client";

import { create } from "zustand";

export type ToastTone = "default" | "success" | "error" | "info";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: { label: string; href?: string; onClick?: () => void };
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id" | "tone" | "duration"> & Partial<Pick<Toast, "tone" | "duration">>) => number;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = ++counter;
    const toast: Toast = { tone: "default", duration: 3500, ...t, id };
    set({ toasts: [...get().toasts.slice(-3), toast] });
    if (toast.duration > 0) setTimeout(() => get().dismiss(id), toast.duration);
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Imperative helper usable from any client event handler. */
export const toast = (t: Parameters<ToastState["push"]>[0]) => useToastStore.getState().push(t);
