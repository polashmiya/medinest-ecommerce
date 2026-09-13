import Link from "next/link";
import { notFound } from "next/navigation";
import { deliveryConfig } from "@/config/commerce.config";
import { siteConfig } from "@/config/site.config";
import { formatDate, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { content } from "@/services/content";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, Disclosure, JsonLd } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ContentBlocks } from "@/components/content/content-ui";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await content.getPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/page/[slug]">) {
  const { slug } = await params;
  const page = await content.getPage(slug);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: routes.page(page.slug) });
}

/** Delivery zones and options, rendered straight from deliveryConfig so numbers never drift. */
function DeliveryTables() {
  return (
    <div className="my-8 space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-fg-subtle">
            <tr>
              <th className="px-4 py-3 font-semibold">Zone</th>
              <th className="px-4 py-3 font-semibold">Delivery time</th>
              <th className="px-4 py-3 font-semibold">Fee</th>
              <th className="px-4 py-3 font-semibold">Free delivery</th>
              <th className="px-4 py-3 font-semibold">Cold chain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {deliveryConfig.zones.map((z) => (
              <tr key={z.id} className="bg-surface">
                <td className="px-4 py-3">
                  <p className="font-semibold text-fg">{z.label}</p>
                  <p className="text-xs capitalize text-fg-subtle">{z.districts.length ? z.districts.join(", ") : "All other districts"}</p>
                </td>
                <td className="px-4 py-3 text-fg">{z.etaLabel}</td>
                <td className="px-4 py-3 font-semibold text-fg">{formatPrice(z.fee)}</td>
                <td className="px-4 py-3 text-fg-muted">{z.freeAbove === null ? "—" : `Orders over ${formatPrice(z.freeAbove)}`}</td>
                <td className="px-4 py-3">
                  {z.coldChain ? <Badge tone="success">Available</Badge> : <Badge tone="neutral">Not available</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {deliveryConfig.options.map((o) => (
          <div key={o.id} className="card p-4">
            <p className="flex items-center gap-2 font-bold text-fg">
              <Icon name={o.id === "express" ? "zap" : "truck"} className="size-4 text-primary-600" />
              {o.label}
            </p>
            <p className="mt-1 text-sm text-fg-muted">{o.description}</p>
            <p className="mt-2 text-sm font-semibold text-fg">{o.extraFee ? `+${formatPrice(o.extraFee)}` : "No extra charge"}</p>
          </div>
        ))}
      </div>
      {deliveryConfig.minimumOrderValue > 0 ? <p className="text-sm text-fg-muted">Minimum order value: {formatPrice(deliveryConfig.minimumOrderValue)}.</p> : null}
    </div>
  );
}

export default async function InfoPage({ params }: PageProps<"/page/[slug]">) {
  const { slug } = await params;
  const page = await content.getPage(slug);
  if (!page) notFound();
  const pages = await content.getPages();
  const crumbs = [{ label: "Home", href: "/" }, { label: page.title }];

  return (
    <div className="container-app py-6 md:py-8">
      <Breadcrumbs items={crumbs} className="mb-5" />
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="order-2 lg:order-1">
          <nav aria-label="Help & policies" className="card p-2 lg:sticky lg:top-36">
            <p className="px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-wide text-fg-subtle">Help & policies</p>
            <ul>
              {pages.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={routes.page(p.slug)}
                    aria-current={p.slug === page.slug ? "page" : undefined}
                    className={cn("block rounded-lg px-3 py-2 text-sm", p.slug === page.slug ? "bg-primary/10 font-semibold text-primary-700 dark:text-primary-300" : "text-fg-muted hover:bg-muted hover:text-fg")}
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t border-line p-3 text-xs text-fg-muted">
              <p className="font-semibold text-fg">Need help?</p>
              <a href={siteConfig.contact.hotlineHref} className="mt-1 flex items-center gap-1.5 hover:text-primary-600">
                <Icon name="phone" className="size-3.5" /> {siteConfig.contact.hotline}
              </a>
              <a href={`mailto:${siteConfig.contact.email}`} className="mt-1 flex items-center gap-1.5 break-all hover:text-primary-600">
                <Icon name="mail" className="size-3.5" /> {siteConfig.contact.email}
              </a>
            </div>
          </nav>
        </aside>

        <article className="order-1 min-w-0 lg:order-2">
          <div className="card p-6 md:p-10">
            <h1 className="text-2xl font-extrabold tracking-tight text-fg md:text-3xl">{page.title}</h1>
            <p className="mt-2 text-sm text-fg-muted">{page.description}</p>
            <p className="mt-1 text-xs text-fg-subtle">
              Last updated <time dateTime={page.updatedAt}>{formatDate(page.updatedAt)}</time>
            </p>
            <ContentBlocks blocks={page.blocks} className="mt-4" />
            {page.kind === "delivery" ? <DeliveryTables /> : null}
            {page.kind === "faq" && page.faqs?.length ? (
              <div className="mt-6 rounded-2xl border border-line px-5">
                {page.faqs.map((f, i) => (
                  <Disclosure key={f.q} summary={f.q} defaultOpen={i === 0}>
                    {f.a}
                  </Disclosure>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      </div>

      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          ...(page.kind === "faq" && page.faqs?.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
