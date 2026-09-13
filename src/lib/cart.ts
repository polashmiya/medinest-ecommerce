import { couponConfig, deliveryConfig, paymentConfig, taxConfig, type Coupon, type DeliveryZone } from "@/config/commerce.config";
import { features } from "@/config/features.config";
import type { AppliedCoupon, CartLine, CartTotals } from "@/types";

export const lineKey = (productId: number, variantId: number) => `${productId}:${variantId}`;

export function zoneById(id: string | null | undefined): DeliveryZone {
  return deliveryConfig.zones.find((z) => z.id === id) ?? deliveryConfig.zones.find((z) => z.id === deliveryConfig.defaultZoneId)!;
}

/** Map a district name to its delivery zone (unknown districts fall back to "outside"). */
export function zoneForDistrict(district: string): DeliveryZone {
  const d = district.trim().toLowerCase();
  return (
    deliveryConfig.zones.find((z) => z.districts.includes(d)) ??
    deliveryConfig.zones.find((z) => z.districts.length === 0) ??
    zoneById(deliveryConfig.defaultZoneId)
  );
}

export function deliveryOptionsFor(zone: DeliveryZone) {
  return deliveryConfig.options.filter((o) => !("zoneIds" in o) || !o.zoneIds || (o.zoneIds as readonly string[]).includes(zone.id));
}

export type CouponCheck = { ok: true; coupon: Coupon; applied: AppliedCoupon } | { ok: false; reason: "unknown" | "min" | "scope"; minSubtotal?: number };

/** Validate a coupon against the current cart and compute its discount. */
export function evaluateCoupon(code: string, lines: CartLine[], subtotal: number): CouponCheck {
  const coupon = couponConfig.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!coupon) return { ok: false, reason: "unknown" };
  const eligible = coupon.productTypes?.length ? lines.filter((l) => coupon.productTypes!.includes(l.snapshot.type)) : lines;
  const eligibleSubtotal = eligible.reduce((s, l) => s + l.snapshot.price * l.qty, 0);
  if (!eligible.length) return { ok: false, reason: "scope" };
  if (subtotal < coupon.minSubtotal) return { ok: false, reason: "min", minSubtotal: coupon.minSubtotal };
  let discount = 0;
  if (coupon.type === "percent") discount = (eligibleSubtotal * coupon.value) / 100;
  if (coupon.type === "fixed") discount = Math.min(coupon.value, eligibleSubtotal);
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  return {
    ok: true,
    coupon,
    applied: { code: coupon.code, label: coupon.label, discount: round(discount), freeShipping: coupon.type === "shipping" },
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

export interface TotalsInput {
  lines: CartLine[];
  couponCode: string | null;
  zoneId: string;
  deliveryOptionId: string;
  paymentMethodId?: string;
}

export function computeTotals({ lines, couponCode, zoneId, deliveryOptionId, paymentMethodId }: TotalsInput): CartTotals & { coupon: AppliedCoupon | null } {
  const subtotal = round(lines.reduce((s, l) => s + l.snapshot.price * l.qty, 0));
  const mrpTotal = round(lines.reduce((s, l) => s + Math.max(l.snapshot.mrp, l.snapshot.price) * l.qty, 0));
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const check = couponCode && features.coupons ? evaluateCoupon(couponCode, lines, subtotal) : null;
  const coupon = check?.ok ? check.applied : null;

  const zone = zoneById(zoneId);
  const option = deliveryOptionsFor(zone).find((o) => o.id === deliveryOptionId) ?? deliveryOptionsFor(zone)[0];
  const freeByThreshold = zone.freeAbove !== null && subtotal >= zone.freeAbove;
  const baseFee = lines.length ? zone.fee : 0;
  const deliveryFeeBeforeDiscount = lines.length ? baseFee + (option?.extraFee ?? 0) : 0;
  const deliveryFee = lines.length ? (freeByThreshold || coupon?.freeShipping ? 0 : baseFee) + (option?.extraFee ?? 0) : 0;

  const couponDiscount = coupon?.discount ?? 0;
  const method = paymentConfig.methods.find((m) => m.id === paymentMethodId);
  const gatewayFee = method && "feePercent" in method && method.feePercent ? round(((subtotal - couponDiscount) * method.feePercent) / 100) : 0;
  const vat = round(((subtotal - couponDiscount) * taxConfig.vatPercent) / 100);
  const cashback = features.cashback
    ? [...paymentConfig.cashbackTiers].reverse().find((t) => subtotal >= t.minSubtotal)?.amount ?? 0
    : 0;

  return {
    itemCount,
    lineCount: lines.length,
    subtotal,
    mrpTotal,
    productDiscount: round(mrpTotal - subtotal),
    couponDiscount,
    deliveryFee,
    deliveryFeeBeforeDiscount,
    cashback,
    vat,
    total: round(Math.max(0, subtotal - couponDiscount + deliveryFee + vat + gatewayFee)),
    freeDeliveryRemaining: zone.freeAbove !== null && lines.length && !freeByThreshold ? round(zone.freeAbove - subtotal) : null,
    rxCount: lines.filter((l) => l.snapshot.rxRequired).length,
    coupon,
  };
}
