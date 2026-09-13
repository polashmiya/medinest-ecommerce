import { t } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { CampaignListing } from "@/components/listing/campaign-listing";

export const metadata = pageMetadata({
  title: "Trending Health & Wellness Products",
  description: "See what customers are ordering right now: the most popular medicines, personal care and wellness products this week.",
  path: routes.trending(),
});

export default async function TrendingPage(props: PageProps<"/trending">) {
  return (
    <CampaignListing
      basePath={routes.trending()}
      title={t("listing.trendingTitle")}
      description="The products customers are viewing and ordering most right now."
      icon="trending-up"
      base={{ sort: "trending" }}
      searchParams={await props.searchParams}
    />
  );
}
