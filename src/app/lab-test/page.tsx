import { notFound } from "next/navigation";
import { currencyConfig } from "@/config/commerce.config";
import { features } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { labCategories, labService } from "@/data/mock/content";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { content } from "@/services/content";
import { Breadcrumbs, JsonLd } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ServiceHero, Steps } from "@/components/content/content-ui";
import { LabTestCatalog } from "@/components/content/lab-tests";

export const metadata = pageMetadata({
  title: "Lab tests with home sample collection",
  description: `Book blood and urine tests with home sample collection from ${siteConfig.name}. Certified partner labs, digital reports and discounted prices.`,
  path: routes.labTest(),
});

const steps = [
  { title: "Choose tests", text: "Pick individual tests or a health check package.", icon: "microscope" },
  { title: "Book a slot", text: "Select a date and time that suits you for home collection.", icon: "calendar" },
  { title: "Sample collection", text: "A trained phlebotomist visits with sealed, single-use kits.", icon: "droplet" },
  { title: "Get your report", text: "Reports are shared digitally, usually within 24 hours.", icon: "file-text" },
];

export default async function LabTestPage() {
  if (!features.labTests) notFound();
  const [tests, packages] = await Promise.all([content.getLabTests(), content.getLabPackages()]);
  const categories = labCategories.filter((c) => tests.some((t) => t.category === c));
  const from = Math.min(...tests.map((t) => t.price));
  const crumbs = [{ label: "Home", href: "/" }, { label: "Lab tests" }];

  return (
    <div className="container-app py-6 md:py-8">
      <Breadcrumbs items={crumbs} className="mb-5" />
      <ServiceHero
        eyebrow="Diagnostics at home"
        title="Lab tests, collected from your home"
        text={`Certified partner labs, trained phlebotomists and digital reports. Tests from ${formatPrice(from)} with up to 25% off.`}
        cover={{ from: "#9a3412", to: "#fb923c", icon: "flask-conical" }}
        aside={
          <ul className="space-y-3 rounded-2xl bg-white/15 p-5 text-sm backdrop-blur-sm">
            {[`Free home collection over ${formatPrice(labService.freeCollectionAbove)}`, "Sealed, single-use collection kits", "Reports on your phone and email"].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <Icon name="circle-check" className="size-4 shrink-0" /> {x}
              </li>
            ))}
          </ul>
        }
      />

      <LabTestCatalog tests={tests} packages={packages} categories={categories} service={labService} />

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-extrabold tracking-tight text-fg md:text-xl">How it works</h2>
        <Steps steps={steps} />
        <p className="mt-4 text-xs text-fg-subtle">
          Lab results should be interpreted by a doctor. For urgent symptoms such as chest pain or breathing difficulty, seek emergency care instead of booking a test.
        </p>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Lab tests with home sample collection",
            serviceType: "Diagnostic home sample collection",
            provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
            areaServed: siteConfig.country,
            offers: { "@type": "AggregateOffer", lowPrice: from, highPrice: Math.max(...tests.map((t) => t.price)), priceCurrency: currencyConfig.code, offerCount: tests.length },
          },
        ]}
      />
    </div>
  );
}
