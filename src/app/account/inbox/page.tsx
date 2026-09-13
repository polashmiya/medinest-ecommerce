import type { Metadata } from "next";
import { InboxView } from "@/components/account/inbox-view";

export const metadata: Metadata = { title: "Inbox" };

export default function InboxPage() {
  return <InboxView />;
}
