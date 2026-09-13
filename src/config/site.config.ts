/**
 * Site identity & organisation details.
 * Everything brand-related lives here so it can be swapped without touching components.
 */
export const siteConfig = {
  name: "MediNest",
  legalName: "MediNest Health Limited",
  tagline: "Medicine, wellness & care. Delivered.",
  description:
    "MediNest is a modern online pharmacy and healthcare store. Order authentic medicines, supplements, beauty, baby care and wellness products with fast home delivery.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://medinest.example.com",
  locale: "en_BD",
  language: "en",
  country: "Bangladesh",
  countryCode: "BD",
  logo: {
    /** Text-mark is rendered by the <Logo/> component; set an image path to use an image instead. */
    image: null as string | null,
    icon: "/icons/icon-192.png",
  },
  contact: {
    hotline: "09600 123 456",
    hotlineHref: "tel:+8809600123456",
    whatsapp: "+880 1700 000 000",
    whatsappHref: "https://wa.me/8801700000000?text=Hi%2C%20I%20want%20to%20order",
    email: "care@medinest.example.com",
    supportHours: "9:00 AM – 11:00 PM, 7 days",
    address: "House 12, Road 7, Banani, Dhaka 1213, Bangladesh",
  },
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    linkedin: "https://linkedin.com/",
  },
  apps: {
    android: "https://play.google.com/store",
    ios: "https://apps.apple.com/",
  },
  legal: {
    tradeLicense: "TRAD/DNCC/000000/2026",
    drugLicense: "DGDA-EPH-0000",
    dbid: "000000000",
    copyrightStart: 2026,
  },
  /** `{products}` is replaced with the live catalog size on the homepage. */
  stats: [
    { value: "3M+", label: "Customers trust us" },
    { value: "{products}", label: "Products available" },
    { value: "64", label: "Districts covered" },
    { value: "4h", label: "Express delivery" },
  ],
  valueProps: [
    { icon: "shield-check", title: "100% Authentic", text: "Sourced directly from manufacturers, distributors and importers." },
    { icon: "pill", title: "Licensed Pharmacists", text: "Every prescription is reviewed by our in-house pharmacist team." },
    { icon: "truck", title: "Fast Home Delivery", text: "Same-day delivery in Dhaka, 1–3 days across the country." },
    { icon: "credit-card", title: "Secure Payments", text: "bKash, Nagad, cards and cash on delivery." },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
