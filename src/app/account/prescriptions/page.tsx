import type { Metadata } from "next";
import { PrescriptionsView } from "@/components/account/prescriptions-view";

export const metadata: Metadata = { title: "Prescriptions" };

export default function PrescriptionsPage() {
  return <PrescriptionsView />;
}
