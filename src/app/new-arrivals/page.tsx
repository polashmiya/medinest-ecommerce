import { t } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { CampaignListing } from "@/components/listing/campaign-listing";

export const metadata = pageMetadata({
  title: "New Arrivals – Latest Medicines & Healthcare Products",
  description: "Recently added medicines, beauty, baby care and wellness products, sourced from licensed manufacturers and distributors.",
  path: routes.newArrivals(),
});

export default async function NewArrivalsPage(props: PageProps<"/new-arrivals">) {
  return (
    <CampaignListing
      basePath={routes.newArrivals()}
      title={t("home.newArrivals")}
      description="The latest additions to our shelves, newest first."
      icon="sparkles"
      base={{ sort: "newest" }}
      searchParams={await props.searchParams}
    />
  );
}
