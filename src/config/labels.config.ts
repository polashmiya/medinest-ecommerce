/**
 * UI copy. Keep every user-facing string here so they can be translated or
 * rebranded. Bengali (bn) shows the shape of a second locale.
 */
export const labels = {
  en: {
    common: {
      search: "Search", searchPlaceholder: "Search medicines, brands, generics…", seeAll: "See all", viewAll: "View all",
      loading: "Loading…", add: "Add", addToCart: "Add to cart", added: "Added", buyNow: "Buy now", remove: "Remove",
      clear: "Clear", clearAll: "Clear all", apply: "Apply", cancel: "Cancel", save: "Save", edit: "Edit", delete: "Delete",
      back: "Back", next: "Next", previous: "Previous", close: "Close", continue: "Continue", confirm: "Confirm", done: "Done",
      yes: "Yes", no: "No", or: "or", off: "OFF", free: "Free", from: "from", to: "to", new: "New", hot: "Hot",
      login: "Login", logout: "Logout", register: "Register", account: "Account", orders: "Orders", inbox: "Inbox", cart: "Cart",
      wishlist: "Wishlist", home: "Home", categories: "Categories", brands: "Brands", deliveryTo: "Delivery to",
      viewDetails: "View details", showMore: "Show more", showLess: "Show less", results: "results", result: "result",
      noResults: "No results found", tryAgain: "Try again", somethingWrong: "Something went wrong", copied: "Copied",
      optional: "optional", required: "Required", all: "All", filter: "Filters", sort: "Sort by", items: "items",
    },
    header: {
      flashSale: "Flash Sale", flashSaleSave: "Save up to {percent}%", placeOrderBy: "Place order by", uploadPrescription: "Upload prescription",
      callToOrder: "Call to order", whatsapp: "WhatsApp", trending: "Trending searches", recent: "Recent searches",
      suggestions: "Suggestions", settings: "Display settings", categoriesMenu: "All categories", menu: "Menu",
    },
    product: {
      rx: "Prescription required", otc: "Over the counter", generic: "Generic", brand: "Brand", manufacturer: "Manufacturer",
      strength: "Strength", form: "Form", stock: "Stock", inStock: "In stock", outOfStock: "Out of stock", lowStock: "Low stock",
      notifyMe: "Request stock", requestSent: "We'll notify you when it's back", peopleViewed: "{count} people viewed this",
      peopleOrdered: "{count}+ ordered", aboutItem: "About this item", overview: "Medicine overview", briefDescription: "Brief description",
      quickTips: "Quick tips", safetyAdvice: "Safety advice", faq: "Frequently asked questions", reviews: "Reviews",
      writeReview: "Write a review", noReviews: "No reviews yet. Be the first to review.", alternativeBrands: "Alternative brands for {name}",
      alternatives: "Alternative brands", youMayLike: "You may also like", relatedProducts: "Related products", recentlyViewed: "Recently viewed",
      shareProduct: "Share", unit: "Unit", quantity: "Quantity", perUnit: "per {unit}", mrp: "MRP", youSave: "You save {amount}",
      deliveryEta: "Delivery in {eta}", dhakaOnly: "Deliverable inside Dhaka only", coldChain: "Requires cold-chain delivery",
      authenticity: "100% authentic — sourced directly from the manufacturer", selectVariant: "Select an option", samePrice: "same price",
      costlier: "{percent}% costlier", cheaper: "Save {percent}%", showPriceFor: "Price for", chooseUnit: "Choose pack size",
      viewedCount: "{count} views", ratingCount: "{count} ratings", basedOn: "Based on {count} reviews", addedToCart: "{name} added to cart",
      rxNote: "This medicine requires a valid prescription. Upload it at checkout.", specs: "Specifications",
      alsoAvailable: "Also available", whatIsPrice: "What is the price of {name} in {country}?",
      priceAnswer: "The latest price of {name} in {country} is {price}. Order online for fast home delivery and cash on delivery.",
    },
    listing: {
      productsIn: "Products in {name}", allProducts: "All products", showing: "Showing {from}–{to} of {total}",
      priceRange: "Price", brands: "Brands", discount: "Discount", availability: "Availability", type: "Type", form: "Form",
      rating: "Rating", andUp: "& up", inStockOnly: "In stock only", rxOnly: "Prescription medicines", otcOnly: "OTC products",
      noProducts: "No products match your filters.", resetFilters: "Reset filters", searchResultsFor: "Search results for “{query}”",
      subcategories: "Browse subcategories", flashSaleTitle: "Flash Sale", flashSaleSub: "Limited-time deals on top products",
      trendingTitle: "Trending now", perPage: "Per page", grid: "Grid", list: "List",
    },
    cart: {
      title: "Your cart", empty: "Your cart is empty", emptyHint: "Browse categories and add products to get started.",
      subtotal: "Subtotal", discount: "Discount", delivery: "Delivery fee", total: "Total", checkout: "Checkout",
      continueShopping: "Continue shopping", coupon: "Coupon code", applyCoupon: "Apply", couponApplied: "Coupon applied",
      couponInvalid: "Invalid or ineligible coupon", freeDeliveryProgress: "Add {amount} more for free delivery",
      freeDeliveryUnlocked: "You've unlocked free delivery", rxItems: "{count} prescription item(s) in cart", cashback: "Cashback",
      maxQty: "Maximum {qty} per order", minQty: "Minimum {qty} per order", removeConfirm: "Remove this item?",
      cartSize: "Cart panel width", savedForLater: "Saved for later", youSaved: "You saved {amount} on this order",
    },
    checkout: {
      title: "Checkout", contact: "Contact", deliveryAddress: "Delivery address", deliveryOption: "Delivery option",
      payment: "Payment method", orderSummary: "Order summary", placeOrder: "Place order", placing: "Placing order…",
      name: "Full name", phone: "Phone number", email: "Email", address: "Street address", area: "Area / Thana", district: "District",
      addressLabel: "Address label", labels: ["Home", "Office", "Hometown"], note: "Order note", notePlaceholder: "Any instruction for the rider?",
      prescription: "Prescription", prescriptionRequired: "Your cart contains prescription medicines. Please upload a prescription.",
      uploadPrescription: "Upload prescription", prescriptionUploaded: "Prescription attached", agree: "I agree to the terms & conditions",
      successTitle: "Order placed successfully", successText: "Thank you! Your order {id} has been received and is being prepared.",
      trackOrder: "Track order", invalidPhone: "Enter a valid phone number", requiredField: "This field is required",
      saveAddress: "Save this address", selectAddress: "Choose a saved address", newAddress: "New address",
    },
    account: {
      title: "My account", welcome: "Welcome, {name}", profile: "Profile", orders: "My orders", noOrders: "You haven't placed any orders yet.",
      orderId: "Order", placedOn: "Placed on", status: "Status", items: "Items", reorder: "Reorder", cancelOrder: "Cancel order",
      wishlist: "Wishlist", noWishlist: "Your wishlist is empty.", addresses: "Addresses", noAddresses: "No saved addresses.",
      prescriptions: "Prescriptions", noPrescriptions: "No prescriptions uploaded.", inbox: "Inbox", noMessages: "No notifications.",
      settings: "Settings", loginTitle: "Login or sign up", loginText: "Enter your mobile number to continue", sendOtp: "Send OTP",
      otpSent: "We sent a 6-digit code to {phone}", verify: "Verify", resend: "Resend code", demoOtp: "Demo OTP: {code}",
      phonePlaceholder: "01XXXXXXXXX", statusLabels: { pending: "Pending", confirmed: "Confirmed", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" },
      cashBalance: "Cash balance", referral: "Referral", notifications: "Notifications",
    },
    home: {
      especiallyForYou: "Especially for you", allYouNeed: "All you need", bestPicks: "Best picks", flashSale: "Flash sale",
      otcMedicine: "OTC medicine", trending: "Trending now", newArrivals: "New arrivals", topBrands: "Top brands", shopByCategory: "Shop by category",
      whyUs: "Why {site}?", orderIn3Steps: "Order medicine in 3 easy steps", downloadApp: "Download the {site} app",
      appText: "Order medicines, upload prescriptions and track deliveries from your phone.", faq: "Frequently asked questions",
      newsletter: "Get health tips & offers", newsletterText: "Subscribe to our newsletter. No spam, unsubscribe anytime.", subscribe: "Subscribe",
      subscribed: "Thanks for subscribing!", emailPlaceholder: "you@example.com",
    },
    settings: {
      title: "Display settings", mode: "Appearance", light: "Light", dark: "Dark", system: "System", color: "Accent colour",
      font: "Font", fontSize: "Text size", radius: "Corner radius", density: "Density", cardSize: "Product card size",
      cartWidth: "Cart panel width", container: "Page width", language: "Language", reset: "Reset to defaults",
      hint: "Preferences are saved on this device.",
    },
    footer: {
      about: "The primary healthcare platform for {country}", paymentPartners: "Online payment partners", logistics: "Delivery partners",
      downloadApp: "Download our app", social: "Connect with us", contact: "Contact info", hotline: "Hotline", whatsapp: "WhatsApp",
      address: "Address", tradeLicense: "Trade license", drugLicense: "Drug license", rights: "All rights reserved.",
    },
    errors: {
      notFoundTitle: "Page not found", notFoundText: "The page you are looking for doesn't exist or has moved.", goHome: "Go to homepage",
      errorTitle: "Something went wrong", errorText: "An unexpected error occurred. Please try again.",
    },
  },
  bn: {
    common: { search: "খুঁজুন", searchPlaceholder: "ঔষধ, ব্র্যান্ড বা জেনেরিক খুঁজুন…", seeAll: "সব দেখুন", addToCart: "কার্টে যোগ করুন", add: "যোগ", cart: "কার্ট", home: "হোম", login: "লগইন", account: "অ্যাকাউন্ট", orders: "অর্ডার", categories: "ক্যাটাগরি" },
    header: { flashSale: "ফ্ল্যাশ সেল", uploadPrescription: "প্রেসক্রিপশন আপলোড" },
    product: { rx: "প্রেসক্রিপশন প্রয়োজন", inStock: "স্টকে আছে", outOfStock: "স্টকে নেই", overview: "ঔষধের বিবরণ" },
    cart: { title: "আপনার কার্ট", empty: "কার্ট খালি", checkout: "চেকআউট", total: "মোট" },
  },
} as const;

export type Locale = keyof typeof labels;
export const defaultLocale: Locale = "en";
export const supportedLocales: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "bn", label: "বাংলা" },
];
