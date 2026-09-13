/**
 * Feature flags. Toggle whole areas of the storefront without code changes.
 * Values can be overridden through NEXT_PUBLIC_FEATURE_* environment variables.
 */
const env = (key: string, fallback: boolean) => {
  const v = process.env[`NEXT_PUBLIC_FEATURE_${key}`];
  if (v === undefined) return fallback;
  return v === "1" || v === "true";
};

export const features = {
  darkMode: env("DARK_MODE", true),
  uiSettingsPanel: env("UI_SETTINGS", true),
  wishlist: env("WISHLIST", true),
  reviews: env("REVIEWS", true),
  writeReviews: env("WRITE_REVIEWS", true),
  recentlyViewed: env("RECENTLY_VIEWED", true),
  flashSale: env("FLASH_SALE", true),
  prescriptionUpload: env("PRESCRIPTION_UPLOAD", true),
  coupons: env("COUPONS", true),
  cashback: env("CASHBACK", true),
  labTests: env("LAB_TESTS", true),
  doctorConsultation: env("DOCTOR", true),
  blog: env("BLOG", true),
  compare: env("COMPARE", false),
  alternativeBrands: env("ALT_BRANDS", true),
  medicineOverview: env("MEDICINE_OVERVIEW", true),
  safetyAdvice: env("SAFETY_ADVICE", true),
  productFaq: env("PRODUCT_FAQ", true),
  productVideos: env("PRODUCT_VIDEOS", false),
  stockRequest: env("STOCK_REQUEST", true),
  whatsappOrder: env("WHATSAPP_ORDER", true),
  callToOrder: env("CALL_TO_ORDER", true),
  pharmacyRegistration: env("PHARMACY_REGISTRATION", true),
  languageSwitcher: env("LANGUAGE_SWITCHER", true),
  newsletter: env("NEWSLETTER", true),
  mobileBottomNav: env("MOBILE_BOTTOM_NAV", true),
  seoContentBlock: env("SEO_CONTENT", true),
  jsonLd: env("JSON_LD", true),
} as const;

export type FeatureFlag = keyof typeof features;
