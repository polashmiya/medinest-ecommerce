import { notFound } from "next/navigation";
import { features } from "@/config/features.config";
import { t } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { CampaignListing } from "@/components/listing/campaign-listing";
import { Countdown } from "@/components/listing/countdown";

export const metadata = pageMetadata({
  title: "Flash Sale – Today's Best Deals on Medicine & Healthcare",
  description: "Limited-time discounts on medicines, personal care, baby care and wellness products. New deals every day with fast home delivery.",
  path: routes.flashSale(),
});

export default async function FlashSalePage(props: PageProps<"/flash-sale">) {
  if (!features.flashSale) notFound();
  return (
    <CampaignListing
      basePath={routes.flashSale()}
      title={t("listing.flashSaleTitle")}
      description={t("listing.flashSaleSub")}
      icon="zap"
      base={{ flash: true, sort: "discount" }}
      searchParams={await props.searchParams}
      aside={<Countdown />}
    />
  );
}
