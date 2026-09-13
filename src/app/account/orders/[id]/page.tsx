import type { Metadata } from "next";
import { OrderDetail } from "@/components/account/order-detail";

export async function generateMetadata(props: PageProps<"/account/orders/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: `Order ${decodeURIComponent(id)}` };
}

export default async function OrderDetailPage(props: PageProps<"/account/orders/[id]">) {
  const { id } = await props.params;
  return <OrderDetail id={decodeURIComponent(id)} />;
}
