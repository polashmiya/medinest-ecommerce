"use client";

import { useEffect, useRef, useState } from "react";
import type { PaymentMethod } from "@/config/commerce.config";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";

/**
 * Simulated payment gateway for wallet / card methods. A real integration
 * would redirect to the provider (or open its SDK) and confirm via webhook.
 * Mount it only while a payment is in progress so each attempt starts fresh.
 */
export function PaymentModal({ method, amount, open, onCancel, onPaid }: { method: PaymentMethod | null; amount: number; open: boolean; onCancel: () => void; onPaid: () => void }) {
  const [stage, setStage] = useState<"confirm" | "processing" | "done">("confirm");
  const onPaidRef = useRef(onPaid);
  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  useEffect(() => {
    if (stage === "processing") {
      const timer = setTimeout(() => setStage("done"), 1600);
      return () => clearTimeout(timer);
    }
    if (stage === "done") {
      const timer = setTimeout(() => onPaidRef.current(), 900);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  if (!method) return null;
  return (
    <Modal
      open={open}
      onClose={stage === "confirm" ? onCancel : () => {}}
      title={`Pay with ${method.label}`}
      footer={
        stage === "confirm" ? (
          <>
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => setStage("processing")} data-autofocus>
              <Icon name="lock" className="size-4" /> Pay {formatPrice(amount)}
            </Button>
          </>
        ) : null
      }
    >
      <p className="mb-4 rounded-lg bg-warning/12 px-3 py-2 text-xs font-semibold text-fg">Demo payment — no money is charged and no card or wallet details are collected.</p>
      {stage === "confirm" ? (
        <div className="flex items-center justify-between rounded-xl border border-line p-4">
          <span className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary-600">
              <Icon name={method.icon === "card" ? "credit-card" : "smartphone"} className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-fg">{method.label}</span>
              <span className="block text-xs text-fg-muted">{method.description}</span>
            </span>
          </span>
          <span className="text-lg font-extrabold text-fg">{formatPrice(amount)}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 text-center" aria-live="polite">
          {stage === "processing" ? (
            <>
              <span className="size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" aria-hidden />
              <p className="mt-4 text-sm font-semibold text-fg">Processing payment…</p>
              <p className="text-xs text-fg-muted">Please don&apos;t close this window.</p>
            </>
          ) : (
            <>
              <span className="grid size-12 place-items-center rounded-full bg-success text-white">
                <Icon name="check" className="size-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-fg">Payment successful</p>
              <p className="text-xs text-fg-muted">Placing your order…</p>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
