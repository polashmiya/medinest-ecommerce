import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/routes";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata = pageMetadata({ title: "Checkout", path: routes.checkout(), noindex: true });

export default function CheckoutPage() {
  return <CheckoutView />;
}
