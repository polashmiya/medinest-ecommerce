import { notFound } from "next/navigation";
import { features } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ServiceHero, Steps } from "@/components/content/content-ui";
import { PharmacyRegistrationForm } from "@/components/content/pharmacy-form";

export const metadata = pageMetadata({
  title: "Register your pharmacy",
  description: `Partner with ${siteConfig.name}: source authentic medicines at wholesale prices, get reliable delivery and grow your pharmacy business.`,
  path: routes.pharmacyRegister(),
});

const benefits = [
  { icon: "badge-percent", title: "Wholesale pricing", text: "Competitive trade prices across thousands of products." },
  { icon: "shield-check", title: "Authentic stock", text: "Products sourced from manufacturers and authorised distributors." },
  { icon: "truck", title: "Reliable delivery", text: "Scheduled deliveries to your shop, including cold-chain items where available." },
  { icon: "wallet", title: "Flexible payment", text: "Mobile wallet, bank transfer and cash on delivery." },
];

const steps = [
  { title: "Apply online", text: "Share your pharmacy and license details.", icon: "file-text" },
  { title: "Verification", text: "We verify your trade and drug licenses.", icon: "badge-check" },
  { title: "Account setup", text: "Get a partner account with trade pricing.", icon: "store" },
  { title: "Start ordering", text: "Order online and receive scheduled deliveries.", icon: "package" },
];

export default function PharmacyRegisterPage() {
  if (!features.pharmacyRegistration) notFound();
  return (
    <div className="container-app py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Register your pharmacy" }]} className="mb-5" />
      <ServiceHero
        eyebrow="For pharmacies"
        title="Grow your pharmacy with us"
        text="Join our partner network to stock authentic products at trade prices with dependable delivery."
        cover={{ from: "#065f46", to: "#10b981", icon: "store" }}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.5fr]">
        <aside className="space-y-4">
          {benefits.map((b) => (
            <div key={b.title} className="card flex items-start gap-4 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary-600 dark:text-primary-300">
                <Icon name={b.icon} className="size-5" />
              </span>
              <div>
                <p className="font-bold text-fg">{b.title}</p>
                <p className="text-sm text-fg-muted">{b.text}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-muted p-4 text-sm text-fg-muted">
            Questions? Call{" "}
            <a href={siteConfig.contact.hotlineHref} className="font-semibold text-primary-700 hover:underline dark:text-primary-300">
              {siteConfig.contact.hotline}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-primary-700 hover:underline dark:text-primary-300">
              {siteConfig.contact.email}
            </a>
            .
          </div>
        </aside>
        <PharmacyRegistrationForm />
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-extrabold tracking-tight text-fg md:text-xl">How partnership works</h2>
        <Steps steps={steps} />
      </section>
    </div>
  );
}
