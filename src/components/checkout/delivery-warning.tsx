"use client";

import Link from "next/link";
import { zoneById } from "@/lib/cart";
import { routes } from "@/lib/routes";
import { useCartStore, useDeliveryStore } from "@/stores";
import { Icon } from "@/components/ui/icon";
import { undeliverableLines } from "./restrictions";

/** Warns when cold-chain / Dhaka-only items can't reach the selected delivery area. */
export function DeliveryWarning({ className }: { className?: string }) {
  const lines = useCartStore((s) => s.lines);
  const zoneId = useDeliveryStore((s) => s.zoneId);
  const district = useDeliveryStore((s) => s.district);
  const blocked = undeliverableLines(lines, zoneById(zoneId));
  if (!blocked.length) return null;
  return (
    <div className={className} role="alert">
      <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3.5 text-sm">
        <Icon name="snowflake" className="mt-0.5 size-5 shrink-0 text-warning" />
        <div className="min-w-0">
          <p className="font-semibold text-fg">
            {blocked.length === 1 ? "1 item" : `${blocked.length} items`} can&apos;t be delivered to {district}
          </p>
          <p className="mt-0.5 text-fg-muted">Cold-chain and Dhaka-only products are delivered inside Dhaka only. Remove them or change your delivery area to continue.</p>
          <ul className="mt-2 space-y-0.5">
            {blocked.map((l) => (
              <li key={l.key}>
                <Link href={routes.product(l.snapshot.slug)} className="font-medium text-fg underline-offset-2 hover:underline">
                  {l.snapshot.name} {l.snapshot.strength}
                </Link>
                <span className="text-xs text-fg-subtle"> · {l.snapshot.coldChain ? "cold chain" : "Dhaka only"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
