/**
 * Catalog presentation rules: listing, sorting, filtering, product cards and images.
 */
export type SortId = "popularity" | "trending" | "price_asc" | "price_desc" | "discount" | "rating" | "newest" | "name_asc";

export const catalogConfig = {
  listing: {
    perPage: 24,
    perPageOptions: [12, 24, 48, 96],
    defaultSort: "popularity" as SortId,
    /** Maximum pages the pagination component shows around the current page. */
    paginationWindow: 2,
    /** Items to prerender per rail on the homepage */
    railSize: 12,
    relatedSize: 12,
  },
  sortOptions: [
    { id: "popularity", label: "Popularity" },
    { id: "trending", label: "Trending" },
    { id: "discount", label: "Highest discount" },
    { id: "price_asc", label: "Price: low to high" },
    { id: "price_desc", label: "Price: high to low" },
    { id: "rating", label: "Top rated" },
    { id: "newest", label: "Newest first" },
    { id: "name_asc", label: "Name A–Z" },
  ] as { id: SortId; label: string }[],
  filters: {
    priceBuckets: [
      { id: "u500", label: "Under ৳500", min: 0, max: 500 },
      { id: "500-1000", label: "৳500 – ৳1000", min: 500, max: 1000 },
      { id: "1000-2000", label: "৳1000 – ৳2000", min: 1000, max: 2000 },
      { id: "o2000", label: "Over ৳2000", min: 2000, max: null },
    ],
    discountBuckets: [
      { id: "d10", label: "10% or more", min: 10 },
      { id: "d20", label: "20% or more", min: 20 },
      { id: "d30", label: "30% or more", min: 30 },
      { id: "d50", label: "50% or more", min: 50 },
    ],
    /** How many brands to show before "Show more". */
    brandLimit: 8,
    showAvailability: true,
    showRxFilter: true,
    showFormFilter: true,
    showRatingFilter: true,
  },
  card: {
    /** Default card size; user can override from the settings panel. */
    defaultSize: "comfortable" as "compact" | "comfortable" | "large",
    sizes: [
      { id: "compact", label: "Compact", minWidth: 150, imageAspect: "1 / 1" },
      { id: "comfortable", label: "Comfortable", minWidth: 190, imageAspect: "1 / 1" },
      { id: "large", label: "Large", minWidth: 240, imageAspect: "4 / 5" },
    ],
    showBrand: true,
    showRating: true,
    showDeliveryEta: true,
    showDiscountBadge: true,
    showRxBadge: true,
    showStrength: true,
    showUnitLabel: true,
    showWishlist: true,
    quickAdd: true,
    /** Truncate product names to this many lines on cards. */
    nameLines: 2,
  },
  images: {
    /**
     * Base path/URL for product photos. When a product has no photo (the mock
     * catalog ships none), an original illustration is generated from its
     * form, type and brand instead — see components/product/product-art.ts.
     */
    baseUrl: process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "",
    cardSizes: "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px",
    detailSizes: "(max-width: 1024px) 100vw, 480px",
    quality: 75,
  },
  badges: {
    rxLabel: "Rx",
    otcLabel: "OTC",
    flashLabel: "Flash Sale",
    coldChainLabel: "Cold chain",
    dhakaOnlyLabel: "Dhaka only",
    outOfStockLabel: "Out of stock",
    newDays: 45,
  },
  search: {
    minChars: 2,
    debounceMs: 250,
    suggestionLimit: 8,
    /** Fields weighted for local search ranking */
    weights: { name: 5, genericName: 3, brandName: 2, categoryName: 1, tags: 1 },
    trendingQueries: ["Napa", "Sergel", "Monas", "Insulin", "Sunscreen", "Face wash", "Diaper", "Whey protein", "Condom", "Thermometer"],
  },
  /** Product types considered "medicine" for Rx / pharmacist rules. */
  medicineTypes: ["medicine", "homeopathy", "ayurvedic", "herbal", "veterinary"],
};
