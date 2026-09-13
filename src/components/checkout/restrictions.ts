import type { DeliveryZone } from "@/config/commerce.config";
import type { CartLine } from "@/types";

/**
 * Items that cannot be delivered to the chosen zone: cold-chain products need a
 * zone with refrigerated delivery, and "Dhaka only" items need the Dhaka zone.
 */
export function undeliverableLines(lines: CartLine[], zone: DeliveryZone) {
  return lines.filter((l) => (l.snapshot.coldChain && !zone.coldChain) || (l.snapshot.dhakaOnly && zone.id !== "dhaka"));
}
