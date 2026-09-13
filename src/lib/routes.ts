/**
 * Central URL builders. Components never assemble paths by hand, so the URL
 * scheme can change in one place.
 */
export const routes = {
  home: () => "/",
  product: (slug: string) => `/product/${slug}`,
  category: (slug: string) => `/category/${slug}`,
  categories: () => "/categories",
  brand: (slug: string) => `/brand/${slug}`,
  brands: () => "/brands",
  search: (q?: string) => (q ? `/search?q=${encodeURIComponent(q)}` : "/search"),
  generic: (name: string) => `/search?generic=${encodeURIComponent(name)}`,
  flashSale: () => "/flash-sale",
  trending: () => "/trending",
  newArrivals: () => "/new-arrivals",
  cart: () => "/cart",
  checkout: () => "/checkout",
  orderSuccess: (id: string) => `/order-success/${id}`,
  login: (next?: string) => (next ? `/login?next=${encodeURIComponent(next)}` : "/login"),
  account: () => "/account",
  orders: () => "/account/orders",
  order: (id: string) => `/account/orders/${id}`,
  wishlist: () => "/account/wishlist",
  addresses: () => "/account/addresses",
  prescriptions: () => "/account/prescriptions",
  inbox: () => "/account/inbox",
  settings: () => "/account/settings",
  uploadPrescription: () => "/upload-prescription",
  labTest: () => "/lab-test",
  doctor: () => "/doctor-consultation",
  blog: () => "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  page: (slug: string) => `/page/${slug}`,
  pharmacyRegister: () => "/pharmacy-register",
};

export function absoluteUrl(path: string, base: string) {
  return new URL(path, base).toString();
}
