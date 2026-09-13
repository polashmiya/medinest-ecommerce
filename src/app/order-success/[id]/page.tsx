import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/routes";
import { OrderSuccessView } from "@/components/checkout/order-success-view";

export async function generateMetadata(props: PageProps<"/order-success/[id]">) {
  const { id } = await props.params;
  return pageMetadata({ title: "Order placed", path: routes.orderSuccess(id), noindex: true });
}

export default async function OrderSuccessPage(props: PageProps<"/order-success/[id]">) {
  const { id } = await props.params;
  return <OrderSuccessView id={decodeURIComponent(id)} />;
}
