import type { ProductSummary } from "./catalog";

export interface CartLine {
  /** `${productId}:${variantId}` */
  key: string;
  productId: number;
  variantId: number;
  qty: number;
  /** Snapshot taken when the item was added; refreshed from the API when possible */
  snapshot: ProductSummary;
  addedAt: string;
}

export interface AppliedCoupon {
  code: string;
  label: string;
  discount: number;
  freeShipping: boolean;
}

export interface CartTotals {
  itemCount: number;
  lineCount: number;
  subtotal: number;
  mrpTotal: number;
  productDiscount: number;
  couponDiscount: number;
  deliveryFee: number;
  deliveryFeeBeforeDiscount: number;
  cashback: number;
  vat: number;
  total: number;
  freeDeliveryRemaining: number | null;
  rxCount: number;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  email?: string;
  street: string;
  area: string;
  district: string;
  isDefault: boolean;
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: number;
  variantId: number;
  name: string;
  image: string;
  qty: number;
  unitLabel: string;
  price: number;
  mrp: number;
  rxRequired: boolean;
  slug: string;
  /** Optional details used to draw the generated thumbnail when there is no photo. */
  strength?: string;
  form?: string;
  type?: string;
  brandName?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  totals: CartTotals;
  address: Address;
  deliveryOptionId: string;
  paymentMethodId: string;
  coupon: AppliedCoupon | null;
  note: string;
  prescriptionIds: string[];
  timeline: { status: OrderStatus; at: string; note?: string }[];
}

export interface Prescription {
  id: string;
  createdAt: string;
  fileName: string;
  /** Data URL of the uploaded image (mock storage) */
  dataUrl: string;
  note?: string;
  status: "pending" | "reviewed" | "rejected";
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  cashBalance: number;
  referralCode: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}
