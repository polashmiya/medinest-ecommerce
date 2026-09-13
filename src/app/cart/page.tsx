import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/routes";
import { CartView } from "@/components/checkout/cart-view";

export const metadata = pageMetadata({ title: "Your cart", path: routes.cart(), noindex: true });

export default function CartPage() {
  return <CartView />;
}
