/**
 * Homepage composition. Sections render in order; each entry maps to a
 * component in `components/home`. Product rails are resolved by the catalog
 * service using the `source` descriptor, so marketing can change the homepage
 * without code.
 */
export type RailSource =
  | { kind: "flash" }
  | { kind: "trending" }
  | { kind: "newest" }
  | { kind: "category"; slug: string }
  | { kind: "brand"; slug: string }
  | { kind: "tag"; tag: string }
  | { kind: "type"; type: string }
  | { kind: "ids"; ids: number[] };

export type HomeSection =
  | { type: "hero"; id: string }
  | { type: "quickActions"; id: string; title: string }
  | { type: "categoryTiles"; id: string; title: string; limit?: number }
  | { type: "productRail"; id: string; title: string; subtitle?: string; source: RailSource; href?: string; limit?: number; accent?: string }
  | { type: "promoBanners"; id: string }
  | { type: "brandStrip"; id: string; title: string; limit?: number }
  | { type: "valueProps"; id: string }
  | { type: "steps"; id: string }
  | { type: "stats"; id: string }
  | { type: "appPromo"; id: string }
  | { type: "seoContent"; id: string }
  | { type: "faq"; id: string }
  | { type: "newsletter"; id: string };

export type HeroArt = "pills" | "skincare" | "baby" | "devices" | "vitamins" | "delivery";

export interface HeroSlide {
  id: string;
  href: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: string;
  /** Illustration drawn by the hero component (no external artwork needed). */
  art: HeroArt;
  /**
   * Two-stop gradient for the slide background. Any CSS colour; theme variables
   * such as `var(--p-600)` make the slide follow the user's accent colour.
   */
  from: string;
  to: string;
  /** Optional image URL; when set it replaces the drawn illustration. */
  image?: string;
}

export interface QuickAction {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  cta: string;
  href: string;
  icon: string;
  gradient: string;
  feature?: string;
  external?: boolean;
}

export const homeConfig = {
  hero: {
    autoplayMs: 6000,
    slides: [
      { id: "s1", href: "/category/medicine", eyebrow: "Everyday savings", title: "Up to 20% off on medicines", subtitle: "Authentic brands from licensed distributors, delivered in hours.", cta: "Shop medicines", art: "pills", from: "var(--p-900)", to: "var(--p-600)" },
      { id: "s2", href: "/category/beauty", eyebrow: "Glow season", title: "Skincare you'll actually finish", subtitle: "Cleansers, serums and sunscreens up to 50% off.", cta: "Explore beauty", art: "skincare", from: "#9f1239", to: "#fb7185" },
      { id: "s3", href: "/category/baby-mom-care", eyebrow: "Baby & mom", title: "Gentle care for little ones", subtitle: "Diapers, feeding and bath essentials in one cart.", cta: "Shop baby care", art: "baby", from: "#0e7490", to: "#22d3ee" },
      { id: "s4", href: "/category/healthcare", eyebrow: "At-home health", title: "Monitor health at home", subtitle: "BP monitors, glucometers and thermometers from trusted makers.", cta: "Shop devices", art: "devices", from: "#065f46", to: "#10b981" },
      { id: "s5", href: "/category/supplement", eyebrow: "Daily wellness", title: "Vitamins & supplements", subtitle: "Build a routine with multivitamins, omega-3 and more.", cta: "Shop wellness", art: "vitamins", from: "#92400e", to: "#f59e0b" },
    ] as HeroSlide[],
    /** Side cards shown next to the slider on large screens. */
    sideCards: [
      { id: "rx", title: "Upload prescription", text: "Pharmacist-verified, up to 10% off", href: "/upload-prescription", art: "pills", from: "var(--p-700)", to: "var(--p-400)" },
      { id: "express", title: "4-hour express", text: "Inside Dhaka, order before 8 PM", href: "/page/delivery", art: "delivery", from: "#047857", to: "#34d399" },
    ] as (Pick<HeroSlide, "id" | "title" | "href" | "art" | "from" | "to"> & { text: string })[],
  },
  quickActions: [
    { id: "whatsapp", eyebrow: "Order", title: "Via WhatsApp", subtitle: "+880 1700 000 000", cta: "Chat now", href: "https://wa.me/8801700000000", icon: "message-circle", gradient: "linear-gradient(151deg, #fffef9 3%, #5cd163 93%)", feature: "whatsappOrder", external: true },
    { id: "prescription", eyebrow: "Up to", title: "10% off", subtitle: "+ cashback", cta: "Upload prescription", href: "/upload-prescription", icon: "file-up", gradient: "linear-gradient(151deg, #fffef9 3%, #10adbe 93%)", feature: "prescriptionUpload" },
    { id: "healthcare", eyebrow: "Up to", title: "60% off", subtitle: "Healthcare devices", cta: "Healthcare", href: "/category/healthcare", icon: "stethoscope", gradient: "linear-gradient(151deg, #fffef9 3%, #a3e635 93%)" },
    { id: "call", eyebrow: "Up to", title: "10% off", subtitle: "Call 09600 123 456", cta: "Call to order", href: "tel:+8809600123456", icon: "phone", gradient: "linear-gradient(151deg, #fffef9 3%, #a78bfa 93%)", feature: "callToOrder" },
    { id: "lab", eyebrow: "Up to", title: "25% off", subtitle: "Home sample collection", cta: "Lab tests", href: "/lab-test", icon: "flask-conical", gradient: "linear-gradient(151deg, #fffef9 3%, #fb923c 93%)", feature: "labTests" },
    { id: "doctor", eyebrow: "From", title: "৳199", subtitle: "Video consultation", cta: "Talk to a doctor", href: "/doctor-consultation", icon: "video", gradient: "linear-gradient(151deg, #fffef9 3%, #f472b6 93%)", feature: "doctorConsultation" },
  ] as QuickAction[],
  sections: [
    { type: "hero", id: "hero" },
    { type: "quickActions", id: "quick", title: "Especially for you" },
    { type: "productRail", id: "flash", title: "Flash sale", subtitle: "Limited-time deals", source: { kind: "flash" }, href: "/flash-sale", accent: "danger" },
    { type: "categoryTiles", id: "tiles", title: "All you need", limit: 18 },
    { type: "productRail", id: "best", title: "Best picks", subtitle: "Top rated by our customers", source: { kind: "trending" }, href: "/trending" },
    { type: "productRail", id: "otc", title: "OTC medicine", subtitle: "No prescription needed", source: { kind: "tag", tag: "otc" }, href: "/category/medicine?rx=otc" },
    { type: "promoBanners", id: "promo" },
    { type: "productRail", id: "skin", title: "Skincare favourites", source: { kind: "category", slug: "skincare" }, href: "/category/skincare" },
    { type: "productRail", id: "baby", title: "Baby & mom care", source: { kind: "category", slug: "baby-mom-care" }, href: "/category/baby-mom-care" },
    { type: "productRail", id: "supp", title: "Vitamins & supplements", source: { kind: "category", slug: "supplement" }, href: "/category/supplement" },
    { type: "brandStrip", id: "brands", title: "Top brands", limit: 16 },
    { type: "productRail", id: "health", title: "Healthcare devices", source: { kind: "category", slug: "healthcare" }, href: "/category/healthcare" },
    { type: "productRail", id: "new", title: "New arrivals", source: { kind: "newest" }, href: "/new-arrivals" },
    { type: "valueProps", id: "why" },
    { type: "steps", id: "steps" },
    { type: "stats", id: "stats" },
    { type: "appPromo", id: "app" },
    { type: "faq", id: "faq" },
    { type: "seoContent", id: "seo" },
    { type: "newsletter", id: "newsletter" },
  ] as HomeSection[],
  steps: [
    { step: 1, title: "Search", text: "Find medicines by brand, generic or manufacturer and compare prices instantly." },
    { step: 2, title: "Upload prescription", text: "Snap a photo of your prescription; our licensed pharmacists verify it in minutes." },
    { step: 3, title: "Get home delivery", text: "Same-day delivery inside Dhaka and 1–3 days everywhere else." },
  ],
  faqs: [
    { q: "Is this a licensed online pharmacy?", a: "Yes. We operate in compliance with the Directorate General of Drug Administration (DGDA) regulations. Every product is sourced legally and verified for authenticity." },
    { q: "Do I need a prescription to order medicine?", a: "Prescription-only medicines (marked Rx) require a valid doctor's prescription uploaded during checkout. OTC products, supplements and personal care items can be ordered directly." },
    { q: "How fast is delivery in Dhaka?", a: "Orders inside Dhaka are usually delivered within 12–24 hours, with a 4-hour express option for orders placed before 8 PM." },
    { q: "Do you deliver outside Dhaka?", a: "Yes, we deliver to all 64 districts. Cold-chain medicines such as insulin are delivered inside Dhaka only." },
    { q: "What payment methods are accepted?", a: "Cash on delivery, bKash, Nagad and all major credit/debit cards." },
    { q: "Can I return a product?", a: "If a product arrives damaged, incorrect or expired you can request a replacement or refund within 24 hours of delivery." },
  ],
  promoBanners: [
    { id: "p1", title: "Upload prescription", text: "Get up to 10% off + cashback on prescription orders", href: "/upload-prescription", tone: "primary" },
    { id: "p2", title: "Lab tests at home", text: "Certified labs, reports within 24 hours", href: "/lab-test", tone: "accent" },
  ],
};
