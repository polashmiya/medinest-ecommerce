/**
 * Navigation structure. Category navigation itself is data-driven (root categories),
 * this file controls everything else: top bar, utility links, footer and mobile nav.
 */
export interface NavLink {
  id: string;
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
  /** Feature flag that must be enabled for the link to render */
  feature?: string;
  badge?: string;
}

export const navigationConfig = {
  /** Slim bar above the header */
  topBar: {
    enabled: true,
    message: "Free delivery inside Dhaka on orders over ৳499",
    links: [
      { id: "track", label: "Track order", href: "/account/orders" },
      { id: "pharmacy", label: "Register your pharmacy", href: "/pharmacy-register", feature: "pharmacyRegistration" },
      { id: "help", label: "Help", href: "/page/faqs" },
    ] as NavLink[],
  },
  /** Primary tabs beside the logo (Store / Lab / Doctor …) */
  primaryTabs: [
    { id: "store", label: "Store", href: "/" },
    { id: "lab", label: "Lab tests", href: "/lab-test", feature: "labTests" },
    { id: "doctor", label: "Doctor", href: "/doctor-consultation", feature: "doctorConsultation" },
    { id: "blog", label: "Blog", href: "/blog", feature: "blog" },
  ] as NavLink[],
  /** Quick "place order by" actions */
  orderBy: [
    { id: "prescription", label: "Upload prescription", href: "/upload-prescription", icon: "file-up", feature: "prescriptionUpload" },
    { id: "call", label: "Call to order", href: "tel:+8809600123456", icon: "phone", feature: "callToOrder" },
    { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/8801700000000", icon: "message-circle", external: true, feature: "whatsappOrder" },
  ] as NavLink[],
  /** Root categories to show in the category strip, by slug order. Anything not listed is appended. */
  categoryOrder: [
    "medicine", "healthcare", "beauty", "sexual-wellness", "baby-mom-care", "herbal", "home-care",
    "supplement", "food-and-nutrition", "pet-care", "veterinary", "homeopathy",
  ],
  /** Extra items in the category strip */
  categoryExtras: [
    { id: "flash", label: "Flash Sale", href: "/flash-sale", icon: "zap", feature: "flashSale", badge: "HOT" },
    { id: "brands", label: "Brands", href: "/brands", icon: "tags" },
  ] as NavLink[],
  accountMenu: [
    { id: "profile", label: "My profile", href: "/account", icon: "user" },
    { id: "orders", label: "My orders", href: "/account/orders", icon: "package" },
    { id: "prescriptions", label: "Prescriptions", href: "/account/prescriptions", icon: "file-text", feature: "prescriptionUpload" },
    { id: "wishlist", label: "Wishlist", href: "/account/wishlist", icon: "heart", feature: "wishlist" },
    { id: "addresses", label: "Addresses", href: "/account/addresses", icon: "map-pin" },
    { id: "inbox", label: "Inbox", href: "/account/inbox", icon: "bell" },
    { id: "settings", label: "Settings", href: "/account/settings", icon: "settings" },
  ] as NavLink[],
  mobileBottomNav: [
    { id: "home", label: "Home", href: "/", icon: "home" },
    { id: "categories", label: "Categories", href: "/categories", icon: "layout-grid" },
    { id: "cart", label: "Cart", href: "/cart", icon: "shopping-bag" },
    { id: "orders", label: "Orders", href: "/account/orders", icon: "package" },
    { id: "account", label: "Account", href: "/account", icon: "user" },
  ] as NavLink[],
  footer: {
    columns: [
      {
        title: "Quick links",
        links: [
          { id: "about", label: "About us", href: "/page/about" },
          { id: "careers", label: "Careers", href: "/page/careers" },
          { id: "privacy", label: "Privacy policy", href: "/page/privacy" },
          { id: "tos", label: "Terms & conditions", href: "/page/tos" },
          { id: "return", label: "Return & refund policy", href: "/page/return-policy" },
        ],
      },
      {
        title: "Our services",
        links: [
          { id: "doctor", label: "Online doctor consultation", href: "/doctor-consultation", feature: "doctorConsultation" },
          { id: "lab", label: "Lab test – home sample collection", href: "/lab-test", feature: "labTests" },
          { id: "delivery", label: "Doorstep medicine delivery", href: "/category/medicine" },
          { id: "beauty", label: "Healthcare & beauty products", href: "/category/beauty" },
        ],
      },
      {
        title: "Useful links",
        links: [
          { id: "blog", label: "Blog", href: "/blog", feature: "blog" },
          { id: "faq", label: "FAQ", href: "/page/faqs" },
          { id: "account", label: "Account", href: "/account" },
          { id: "pharmacy", label: "Register your pharmacy", href: "/pharmacy-register", feature: "pharmacyRegistration" },
          { id: "brands", label: "All brands", href: "/brands" },
        ],
      },
    ] as { title: string; links: NavLink[] }[],
    paymentPartners: ["bKash", "Nagad", "Visa", "Mastercard", "Amex", "Rocket"],
    logisticsPartners: ["Pathao", "RedX", "Steadfast", "eCourier"],
    showAppBadges: true,
    showSocial: true,
  },
};
