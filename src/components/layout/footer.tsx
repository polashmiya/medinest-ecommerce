import Link from "next/link";
import { features } from "@/config/features.config";
import { navigationConfig } from "@/config/navigation.config";
import { siteConfig } from "@/config/site.config";
import { t } from "@/lib/i18n";
import type { CategoryNode } from "@/types";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/ui/icon";
import { Logo } from "./logo";

const isEnabled = (feature?: string) => !feature || features[feature as keyof typeof features] !== false;

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-8 items-center rounded-md border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-white/80">{children}</span>;
}

export function Footer({ tree }: { tree: CategoryNode[] }) {
  const f = navigationConfig.footer;
  const year = new Date().getFullYear();
  const columns = [
    ...f.columns.map((col) => ({ title: col.title, links: col.links.filter((l) => isEnabled(l.feature)) })),
    { title: "Departments", links: tree.slice(0, 8).map((c) => ({ id: String(c.id), label: c.name, href: routes.category(c.slug) })) },
  ];
  return (
    <footer className="mt-16 bg-[#0b1020] pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-sm text-white/70 md:pb-0">
      <div className="container-app grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <div className="[&_a]:text-white">
            <Logo />
          </div>
          <p className="mt-4 max-w-xs leading-relaxed">{t("footer.about", { country: siteConfig.country })}. {siteConfig.tagline}</p>
          <ul className="mt-5 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <Icon name="headphones" className="mt-0.5 size-4 shrink-0 text-accent-300" />
              <span>
                {t("footer.hotline")}: <a href={siteConfig.contact.hotlineHref} className="font-semibold text-white hover:underline">{siteConfig.contact.hotline}</a>
                <span className="block text-xs text-white/50">{siteConfig.contact.supportHours}</span>
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="message-circle" className="size-4 shrink-0 text-accent-300" />
              <a href={siteConfig.contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-white">{siteConfig.contact.whatsapp}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="mail" className="size-4 shrink-0 text-accent-300" />
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white">{siteConfig.contact.email}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="map-pin" className="mt-0.5 size-4 shrink-0 text-accent-300" />
              <span>{siteConfig.contact.address}</span>
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="hidden md:block">
            <p className="mb-4 text-sm font-bold text-white">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.id}>
                  <Link href={l.href} className="hover:text-white hover:underline">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Phones: the same links as collapsible sections, app-settings style. */}
        <div className="-mt-4 divide-y divide-white/10 border-y border-white/10 md:hidden">
          {columns.map((col) => (
            <details key={col.title} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-sm font-bold text-white [&::-webkit-details-marker]:hidden">
                {col.title}
                <Icon name="chevron-down" className="size-4 text-white/60 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 pb-4">
                {col.links.map((l) => (
                  <li key={l.id}>
                    <Link href={l.href} className="block py-0.5 hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app grid gap-6 py-8 md:grid-cols-3">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">{t("footer.paymentPartners")}</p>
            <div className="flex flex-wrap gap-2">{f.paymentPartners.map((p) => <Chip key={p}>{p}</Chip>)}</div>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">{t("footer.logistics")}</p>
            <div className="flex flex-wrap gap-2">{f.logisticsPartners.map((p) => <Chip key={p}>{p}</Chip>)}</div>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            {f.showAppBadges ? (
              <div className="flex gap-2">
                <a href={siteConfig.apps.android} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 hover:bg-white/10">
                  <Icon name="smartphone" className="size-5 text-white" />
                  <span className="leading-tight"><span className="block text-[0.625rem] text-white/60">Get it on</span><span className="block text-xs font-bold text-white">Android</span></span>
                </a>
                <a href={siteConfig.apps.ios} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 hover:bg-white/10">
                  <Icon name="smartphone" className="size-5 text-white" />
                  <span className="leading-tight"><span className="block text-[0.625rem] text-white/60">Download on</span><span className="block text-xs font-bold text-white">iOS</span></span>
                </a>
              </div>
            ) : null}
            {f.showSocial ? (
              <div className="flex gap-2">
                {Object.entries(siteConfig.social).map(([name, href]) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name} className="grid size-9 place-items-center rounded-full border border-white/15 text-xs font-bold uppercase text-white hover:bg-white/10">
                    {name.slice(0, 2)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app flex flex-col gap-2 py-5 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {siteConfig.legal.copyrightStart === year ? year : `${siteConfig.legal.copyrightStart}–${year}`} {siteConfig.legalName}. {t("footer.rights")}</p>
          <p>
            {t("footer.tradeLicense")}: {siteConfig.legal.tradeLicense} · {t("footer.drugLicense")}: {siteConfig.legal.drugLicense}
          </p>
        </div>
      </div>
    </footer>
  );
}
