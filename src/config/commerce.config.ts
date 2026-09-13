/**
 * Commerce rules: currency, delivery, payments, cart limits and coupons.
 */
export const currencyConfig = {
  code: "BDT",
  symbol: "৳",
  symbolPosition: "before" as "before" | "after",
  decimals: 2,
  /** Hide trailing ".00" for whole numbers. */
  trimZeros: true,
  thousandSeparator: ",",
  decimalSeparator: ".",
  locale: "en-BD",
};

export interface DeliveryZone {
  id: string;
  label: string;
  /** District names that map to this zone (lower-case) */
  districts: string[];
  fee: number;
  freeAbove: number | null;
  etaLabel: string;
  etaHours: [number, number];
  /** Cold-chain / refrigerated items allowed */
  coldChain: boolean;
}

export const deliveryConfig = {
  defaultCountry: "Bangladesh",
  defaultZoneId: "dhaka",
  zones: [
    { id: "dhaka", label: "Inside Dhaka", districts: ["dhaka"], fee: 40, freeAbove: 499, etaLabel: "12–24 hours", etaHours: [12, 24], coldChain: true },
    { id: "dhaka-suburb", label: "Dhaka Suburbs", districts: ["gazipur", "narayanganj", "savar", "keraniganj"], fee: 60, freeAbove: 999, etaLabel: "24–48 hours", etaHours: [24, 48], coldChain: false },
    { id: "outside", label: "Outside Dhaka", districts: [], fee: 99, freeAbove: 1499, etaLabel: "2–4 days", etaHours: [48, 96], coldChain: false },
  ] satisfies DeliveryZone[],
  options: [
    { id: "regular", label: "Regular delivery", description: "Delivered within the standard window for your area.", extraFee: 0 },
    { id: "express", label: "Express (Dhaka only)", description: "Within 4 hours for orders placed before 8 PM.", extraFee: 60, zoneIds: ["dhaka"] },
  ],
  /** Minimum order value for checkout (0 = none). */
  minimumOrderValue: 0,
  /** Shown on product pages. */
  slaLabel: "Delivery in 12–24 hours inside Dhaka",
  districts: [
    "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Gazipur", "Narayanganj",
    "Comilla", "Cox's Bazar", "Bogura", "Jessore", "Dinajpur", "Tangail", "Pabna", "Kushtia", "Noakhali", "Feni", "Brahmanbaria",
    "Narsingdi", "Kishoreganj", "Manikganj", "Munshiganj", "Faridpur", "Gopalganj", "Madaripur", "Rajbari", "Shariatpur",
    "Savar", "Keraniganj", "Habiganj", "Moulvibazar", "Sunamganj", "Chandpur", "Lakshmipur", "Bandarban", "Khagrachari",
    "Rangamati", "Natore", "Naogaon", "Chapainawabganj", "Joypurhat", "Sirajganj", "Bagerhat", "Chuadanga", "Jhenaidah",
    "Magura", "Meherpur", "Narail", "Satkhira", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur", "Gaibandha",
    "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon", "Jamalpur", "Netrokona", "Sherpur",
  ],
};

export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  icon: "cash" | "mobile" | "card";
  enabled: boolean;
  /** Extra charge percentage applied to subtotal (e.g. card gateway fee). */
  feePercent?: number;
}

export const paymentConfig = {
  methods: [
    { id: "cod", label: "Cash on Delivery", description: "Pay when you receive the order.", icon: "cash", enabled: true },
    { id: "bkash", label: "bKash", description: "Pay with your bKash wallet.", icon: "mobile", enabled: true },
    { id: "nagad", label: "Nagad", description: "Pay with your Nagad wallet.", icon: "mobile", enabled: true },
    { id: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, Amex.", icon: "card", enabled: true, feePercent: 0 },
  ] satisfies PaymentMethod[],
  defaultMethod: "cod",
  /** Cashback tiers shown in cart (marketing). */
  cashbackTiers: [
    { minSubtotal: 1000, amount: 10 },
    { minSubtotal: 2000, amount: 20 },
    { minSubtotal: 3000, amount: 30 },
  ],
};

export const cartConfig = {
  /** Hard cap on distinct lines. */
  maxLines: 50,
  /** Default max qty per line if product doesn't define one. */
  defaultMaxQty: 20,
  /** localStorage keys (namespace all keys to avoid collisions). */
  storageKeys: {
    cart: "medinest.cart.v1",
    wishlist: "medinest.wishlist.v1",
    auth: "medinest.auth.v1",
    orders: "medinest.orders.v1",
    settings: "medinest.settings.v1",
    recent: "medinest.recent.v1",
    reviews: "medinest.reviews.v1",
    prescriptions: "medinest.prescriptions.v1",
    addresses: "medinest.addresses.v1",
    delivery: "medinest.delivery.v1",
    notifications: "medinest.notifications.v1",
    stockRequests: "medinest.stock-requests.v1",
    searches: "medinest.searches.v1",
  },
  /** Recently viewed products kept on the device. */
  recentLimit: 20,
  /** Uploaded prescription images are downscaled to this many pixels on the long edge. */
  prescriptionMaxPx: 1400,
  prescriptionMaxFiles: 5,
  /** Prescription-only items require an uploaded prescription before checkout completes. */
  requirePrescriptionForRx: true,
  /** Show the "you may also like" rail inside the cart drawer. */
  showCartSuggestions: true,
};

export interface Coupon {
  code: string;
  label: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  /** Restrict to product types (e.g. "medicine"). Empty = all. */
  productTypes?: string[];
}

export const couponConfig: Coupon[] = [
  { code: "WELCOME10", label: "10% off your first order", type: "percent", value: 10, minSubtotal: 500, maxDiscount: 200 },
  { code: "FREESHIP", label: "Free delivery", type: "shipping", value: 0, minSubtotal: 299 },
  { code: "MED50", label: "৳50 off medicines", type: "fixed", value: 50, minSubtotal: 800, productTypes: ["medicine"] },
  { code: "BEAUTY15", label: "15% off beauty", type: "percent", value: 15, minSubtotal: 1000, maxDiscount: 500, productTypes: ["beauty"] },
];

export const taxConfig = {
  /** VAT is included in MRP in Bangladesh; keep 0 to avoid double taxing. */
  vatPercent: 0,
  label: "VAT",
};
