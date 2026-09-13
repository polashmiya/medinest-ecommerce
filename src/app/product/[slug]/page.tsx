import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogConfig } from "@/config/catalog.config";
import { currencyConfig, deliveryConfig } from "@/config/commerce.config";
import { features } from "@/config/features.config";
import { seoConfig } from "@/config/seo.config";
import { siteConfig } from "@/config/site.config";
import { formatCompact, formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { catalog, defaultVariant, personalizeGeneric, toSummary, unitLabel } from "@/services/catalog";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, JsonLd, Stars } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ProductImage, productArtUrl } from "@/components/product/product-image";
import { ProductRail } from "@/components/product/product-rail";
import { Alternatives } from "@/components/product/detail/alternatives";
import { DeliveryInfo } from "@/components/product/detail/delivery-info";
import { AboutItem, MedicineInfo } from "@/components/product/detail/medicine-info";
import { ProductFaq, type FaqItem } from "@/components/product/detail/product-faq";
import { ProductSpecs } from "@/components/product/detail/product-specs";
import { PurchaseBox } from "@/components/product/detail/purchase-box";
import { RecentlyViewed } from "@/components/product/detail/recently-viewed";
import { ReviewsSection } from "@/components/product/detail/reviews-section";
import { StickyBuyBar } from "@/components/product/detail/sticky-buy-bar";

/** Re-render cached product pages at most hourly so prices stay fresh with a live API. */
export const revalidate = 3600;

/** Prerender the most popular products at build time; the rest render on first request. */
export async function generateStaticParams() {
  const index = await catalog.getProductIndex({ limit: 300, sort: "popularity" });
  return index.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) return { title: t("errors.notFoundTitle"), robots: { index: false } };
  const v = defaultVariant(product);
  const title = seoConfig.productTitle(product.name, product.form, product.strength, product.genericName);
  const description =
    product.metaDescription ||
    `Buy ${product.name} ${product.strength} at ${formatPrice(v.price)} with home delivery across ${siteConfig.country}.`;
  return {
    ...pageMetadata({ title, description, path: routes.product(product.slug) }),
    keywords: [product.name, product.genericName, product.brandName, `${product.name} price in ${siteConfig.country}`].filter(Boolean),
  };
}

const clean = (s: string) => s.replace(/\.{2,}/g, ".").replace(/\s+/g, " ").trim();

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await catalog.getProductBySlug(slug);
  if (!product) notFound();

  const [trail, alternatives, related, reviews, brand] = await Promise.all([
    catalog.getCategoryTrail(product.categoryId),
    features.alternativeBrands ? catalog.getAlternatives(product.id, 10) : Promise.resolve([]),
    catalog.getRelatedProducts(product.id),
    features.reviews ? catalog.getReviews(product.id, { perPage: 30 }) : Promise.resolve(null),
    product.brandId != null ? catalog.getBrand(product.brandId) : Promise.resolve(null),
  ]);

  const summary = toSummary(product);
  const variant = defaultVariant(product);
  const isMedicine = catalogConfig.medicineTypes.includes(product.type);
  const generic = product.generic ? personalizeGeneric(product.generic, product.name) : null;
  const url = routes.product(product.slug);
  const leaf = trail[trail.length - 1];
  const packs = product.units.filter((u) => u.multiplier > 1).map((u) => `${u.label} (${u.multiplier} ${variant.baseUnit || "units"})`);

  const crumbs = [{ label: t("common.home"), href: routes.home() }, ...trail.map((c) => ({ label: c.name, href: routes.category(c.slug) })), { label: product.name }];

  const faqs: FaqItem[] = [
    {
      q: t("product.whatIsPrice", { name: product.name, country: siteConfig.country }),
      a: t("product.priceAnswer", { name: `${product.name} ${product.strength}`.trim(), country: siteConfig.country, price: `${formatPrice(variant.price)} per ${(variant.salesUnit || "pack").toLowerCase()}` }),
    },
    ...(isMedicine
      ? [
          {
            q: `Do I need a prescription to buy ${product.name}?`,
            a: product.rxRequired
              ? `Yes. ${product.name} is a prescription-only medicine. Upload a valid prescription at checkout and our pharmacists will verify it before dispatch.`
              : `No. ${product.name} is available over the counter, but you should still use it as directed and consult a doctor if symptoms persist.`,
          },
        ]
      : []),
    ...(product.genericName ? [{ q: `What is the generic name of ${product.name}?`, a: `The active ingredient in ${product.name} is ${product.genericName}${product.strength ? ` (${product.strength})` : ""}.` }] : []),
    ...(product.manufacturer ? [{ q: `Who makes ${product.name}?`, a: `${product.name} is manufactured by ${product.manufacturer}.` }] : []),
    {
      q: `How quickly will ${product.name} be delivered?`,
      a:
        product.coldChain || product.dhakaOnly
          ? `This item is delivered inside Dhaka only, usually within ${deliveryConfig.zones[0].etaLabel}.`
          : `${deliveryConfig.zones.map((z) => `${z.label}: ${z.etaLabel}`).join("; ")}. Cash on delivery is available.`,
    },
    ...(alternatives.length && product.genericName
      ? [
          {
            q: `Are there alternatives to ${product.name}?`,
            a: `Yes. ${alternatives.length} other brand${alternatives.length > 1 ? "s" : ""} with ${product.genericName} in the same form ${alternatives.length > 1 ? "are" : "is"} available, starting from ${formatPrice(Math.min(...alternatives.map((a) => a.price)))}. Ask your doctor before switching.`,
          },
        ]
      : []),
  ];

  const sections = [
    generic && features.medicineOverview ? { id: "overview", label: "Overview" } : { id: "about", label: "About" },
    { id: "specs", label: "Details" },
    alternatives.length && features.alternativeBrands ? { id: "alternatives", label: "Alternatives" } : null,
    features.reviews ? { id: "reviews", label: "Reviews" } : null,
    features.productFaq ? { id: "faq", label: "FAQ" } : null,
  ].filter((s): s is { id: string; label: string } => Boolean(s));

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: [product.name, product.form, product.strength].filter(Boolean).join(" "),
    description: clean(product.shortDescription || product.metaDescription),
    sku: variant.sku,
    category: trail.map((c) => c.name).join(" > "),
    image: [new URL(`${url}/opengraph-image`, siteConfig.url).toString(), new URL(productArtUrl(product.id), siteConfig.url).toString()],
    ...(product.brandName ? { brand: { "@type": "Brand", name: product.brandName } } : {}),
    ...(product.manufacturer ? { manufacturer: { "@type": "Organization", name: product.manufacturer } } : {}),
    offers: {
      "@type": "Offer",
      url: new URL(url, siteConfig.url).toString(),
      priceCurrency: currencyConfig.code,
      price: variant.price.toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: summary.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: siteConfig.name },
    },
    ...(product.rating.count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.average.toFixed(1), reviewCount: product.rating.count, bestRating: 5, worstRating: 1 } }
      : {}),
  };

  return (
    <>
      <div className="container-app pb-24 pt-4 md:pb-10 md:pt-6">
        <Breadcrumbs items={crumbs} />

        <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Visual */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-44">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-muted">
                <ProductImage product={product} sizes={catalogConfig.images.detailSizes} priority />
                <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                  {summary.discountPercent > 0 ? <Badge tone="discount">{summary.discountPercent}% off</Badge> : null}
                  {product.isFlashSale && features.flashSale ? (
                    <Badge tone="warning">
                      <Icon name="zap" className="size-3" /> {catalogConfig.badges.flashLabel}
                    </Badge>
                  ) : null}
                </div>
              </div>
              <ul className="mt-3 grid grid-cols-3 gap-2 text-center text-[0.6875rem] font-medium text-fg-muted">
                <li className="rounded-xl bg-surface p-2 ring-1 ring-line">
                  <Icon name="shield-check" className="mx-auto mb-1 size-4 text-success" />
                  Genuine product
                </li>
                <li className="rounded-xl bg-surface p-2 ring-1 ring-line">
                  <Icon name="rotate-ccw" className="mx-auto mb-1 size-4 text-primary-600" />
                  Easy returns
                </li>
                <li className="rounded-xl bg-surface p-2 ring-1 ring-line">
                  <Icon name="lock" className="mx-auto mb-1 size-4 text-accent-600" />
                  Secure payment
                </li>
              </ul>
            </div>
          </div>

          {/* Title + purchase */}
          <div className="min-w-0 lg:col-span-7 xl:col-span-5">
            <div className="flex flex-wrap gap-1.5">
              {isMedicine ? product.rxRequired ? <Badge tone="rx">{t("product.rx")}</Badge> : <Badge tone="success">{t("product.otc")}</Badge> : null}
              {product.coldChain ? (
                <Badge tone="info">
                  <Icon name="snowflake" className="size-3" /> {catalogConfig.badges.coldChainLabel}
                </Badge>
              ) : null}
              {product.dhakaOnly ? <Badge tone="neutral">{catalogConfig.badges.dhakaOnlyLabel}</Badge> : null}
              <Badge tone={summary.inStock ? "success" : "danger"}>{summary.inStock ? t("product.inStock") : t("product.outOfStock")}</Badge>
            </div>

            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-fg md:text-3xl">
              {product.name}
              {product.form || product.strength ? <span className="font-semibold text-fg-muted"> {[product.form, product.strength].filter(Boolean).join(" ")}</span> : null}
            </h1>

            <dl className="mt-3 space-y-1 text-sm">
              {product.genericName ? (
                <div className="flex gap-2">
                  <dt className="text-fg-subtle">{t("product.generic")}:</dt>
                  <dd>
                    <Link href={routes.search(product.genericName)} className="font-semibold text-primary-600 hover:underline dark:text-primary-300">
                      {product.genericName}
                    </Link>
                  </dd>
                </div>
              ) : null}
              {product.brandName ? (
                <div className="flex gap-2">
                  <dt className="text-fg-subtle">{t("product.manufacturer")}:</dt>
                  <dd>
                    {brand ? (
                      <Link href={routes.brand(brand.slug)} className="font-semibold text-fg hover:text-primary-600 hover:underline">
                        {product.brandName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-fg">{product.brandName}</span>
                    )}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-muted">
              {product.rating.count > 0 ? (
                <a href="#reviews" className="flex items-center gap-1.5 hover:text-fg">
                  <Stars value={product.rating.average} />
                  <span className="font-semibold text-fg">{product.rating.average.toFixed(1)}</span>
                  <span>({t("product.ratingCount", { count: product.rating.count })})</span>
                </a>
              ) : null}
              {product.stats.viewed > 0 ? (
                <span className="flex items-center gap-1">
                  <Icon name="eye" className="size-3.5" /> {t("product.peopleViewed", { count: formatCompact(product.stats.viewed) })}
                </span>
              ) : null}
              {product.stats.ordered > 0 ? (
                <span className="flex items-center gap-1">
                  <Icon name="package" className="size-3.5" /> {t("product.peopleOrdered", { count: formatCompact(product.stats.ordered) })}
                </span>
              ) : null}
            </div>

            <div className="mt-5">
              <PurchaseBox product={summary} units={product.units} />
            </div>
          </div>

          {/* Delivery / trust */}
          <aside className="grid gap-4 sm:grid-cols-2 lg:col-span-12 xl:col-span-3 xl:grid-cols-1 xl:content-start">
            <DeliveryInfo coldChain={product.coldChain} dhakaOnly={product.dhakaOnly} />
            {product.rxRequired && features.prescriptionUpload ? (
              <div className="rounded-2xl border border-rx/25 bg-rx/5 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-fg">
                  <Icon name="file-text" className="size-4 text-rx" /> {t("product.rx")}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{t("product.rxNote")}</p>
                <Link href={routes.uploadPrescription()} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-rx hover:underline">
                  {t("header.uploadPrescription")} <Icon name="arrow-right" className="size-4" />
                </Link>
              </div>
            ) : null}
            <div className="rounded-2xl border border-line bg-surface p-4 sm:col-span-2 xl:col-span-1">
              <ul className="space-y-3">
                {siteConfig.valueProps.map((v) => (
                  <li key={v.title} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary-600">
                      <Icon name={v.icon} className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-fg">{v.title}</span>
                      <span className="block text-xs text-fg-muted">{v.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* In-page navigation */}
        <nav aria-label="Product sections" className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="whitespace-nowrap border-b-2 border-transparent px-3 pb-3 text-sm font-semibold text-fg-muted hover:border-primary-500 hover:text-fg">
              {s.label}
            </a>
          ))}
        </nav>

        <div className="mt-8 grid gap-8 xl:grid-cols-12">
          <div className="min-w-0 space-y-10 xl:col-span-9">
            {generic ? <MedicineInfo info={generic} productName={product.name} /> : null}
            {!generic || !features.medicineOverview ? (
              <AboutItem summary={clean(product.shortDescription || product.metaDescription)} descriptionHtml={product.descriptionHtml} isMedicine={isMedicine} />
            ) : null}
            <ProductSpecs
              rows={[
                { label: t("product.brand"), value: product.brandName, href: brand ? routes.brand(brand.slug) : undefined },
                { label: t("product.manufacturer"), value: product.manufacturer !== product.brandName ? product.manufacturer : "" },
                { label: t("product.generic"), value: product.genericName, href: product.genericName ? routes.search(product.genericName) : undefined },
                { label: t("product.strength"), value: product.strength },
                { label: t("product.form"), value: product.form },
                { label: "Sold as", value: unitLabel(summary) },
                { label: "Also available as", value: packs.filter((p) => !p.startsWith(`${variant.salesUnit} `)).join(", ") },
                { label: "Category", value: leaf?.name ?? "", href: leaf ? routes.category(leaf.slug) : undefined },
                { label: "Prescription", value: isMedicine ? (product.rxRequired ? "Required" : "Not required (OTC)") : "" },
                { label: "Storage", value: product.coldChain ? "Keep refrigerated at 2–8 °C; delivered in a cold-chain pack" : isMedicine ? "Store below 30 °C in a dry place, away from light" : "Store in a cool, dry place" },
                { label: "Delivery", value: product.coldChain || product.dhakaOnly ? "Inside Dhaka only" : "All 64 districts" },
                { label: "SKU", value: variant.sku },
              ]}
            />
            <Alternatives current={summary} items={alternatives} genericName={product.genericName} />
            {reviews ? (
              <ReviewsSection productId={product.id} variantId={variant.id} average={product.rating.average} count={product.rating.count} reviews={reviews.items} />
            ) : null}
            <ProductFaq items={faqs} />
          </div>

          <aside className="xl:col-span-3">
            <div className="space-y-4 xl:sticky xl:top-44">
              <div className="rounded-2xl bg-linear-to-br from-primary-700 to-primary-900 p-5 text-white">
                <p className="text-sm font-bold">Need help ordering?</p>
                <p className="mt-1 text-xs text-white/80">Our pharmacists are available {siteConfig.contact.supportHours}.</p>
                <a href={siteConfig.contact.hotlineHref} className="mt-4 flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2.5 text-sm font-semibold hover:bg-white/20">
                  <Icon name="phone" className="size-4" /> {siteConfig.contact.hotline}
                </a>
                {features.whatsappOrder ? (
                  <a href={siteConfig.contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2.5 text-sm font-semibold hover:bg-white/20">
                    <Icon name="message-circle" className="size-4" /> {t("header.whatsapp")}
                  </a>
                ) : null}
              </div>
              <p className="rounded-2xl border border-line bg-surface p-4 text-xs leading-relaxed text-fg-subtle">
                Product information is provided for reference and may differ from the pack you receive. It is not a substitute for advice from a doctor or pharmacist.
              </p>
            </div>
          </aside>
        </div>

        <ProductRail title={t("product.relatedProducts")} products={related} href={leaf ? routes.category(leaf.slug) : undefined} className="mt-14" />
        <RecentlyViewed product={summary} className="mt-12" />
      </div>

      <StickyBuyBar product={summary} />

      {features.jsonLd ? <JsonLd data={[productLd, breadcrumbJsonLd(crumbs)]} /> : null}
    </>
  );
}
