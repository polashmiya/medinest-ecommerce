import Link from "next/link";
import { features } from "@/config/features.config";
import { homeConfig } from "@/config/home.config";
import { siteConfig } from "@/config/site.config";
import { formatNumber } from "@/lib/format";
import { t } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Brand, CategoryNode } from "@/types";
import { ButtonLink } from "@/components/ui/button";
import { Disclosure, JsonLd, SectionHeader } from "@/components/ui/display";
import { departmentIcons, Icon } from "@/components/ui/icon";
import { BrandTile } from "@/components/listing/brand-tile";
import { Rail } from "@/components/product/rail";
import { HeroArt } from "./hero-art";
import { HeroCarousel } from "./hero-carousel";

const isEnabled = (feature?: string) => !feature || features[feature as keyof typeof features] !== false;

export function HeroSection() {
  const { slides, sideCards, autoplayMs } = homeConfig.hero;
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <HeroCarousel interval={autoplayMs}>
        {slides.map((s, i) => (
          <Link key={s.id} href={s.href} className="relative flex min-h-56 items-center overflow-hidden md:min-h-80" style={{ background: `linear-gradient(120deg, ${s.from}, ${s.to})` }}>
            <div className="relative z-10 max-w-md p-6 text-white md:p-10">
              {s.eyebrow ? <p className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">{s.eyebrow}</p> : null}
              {i === 0 ? <h1 className="text-2xl font-extrabold leading-tight tracking-tight md:text-4xl">{s.title}</h1> : <h2 className="text-2xl font-extrabold leading-tight tracking-tight md:text-4xl">{s.title}</h2>}
              {s.subtitle ? <p className="mt-2 text-sm text-white/85 md:text-base">{s.subtitle}</p> : null}
              {s.cta ? (
                <span className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-slate-900 shadow-lg">
                  {s.cta} <Icon name="arrow-right" className="size-4" />
                </span>
              ) : null}
            </div>
            <HeroArt art={s.art} className="absolute -right-6 bottom-0 h-[85%] w-auto opacity-60 sm:opacity-100 md:right-6" />
          </Link>
        ))}
      </HeroCarousel>
      <div className="hidden gap-4 lg:grid lg:grid-rows-2">
        {sideCards.map((c) => (
          <Link key={c.id} href={c.href} className="group relative flex flex-col justify-end overflow-hidden rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
            <HeroArt art={c.art} className="absolute -right-6 -top-4 h-36 w-auto transition-transform duration-300 group-hover:scale-105" />
            <p className="relative text-lg font-extrabold">{c.title}</p>
            <p className="relative text-sm text-white/85">{c.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function QuickActions({ title }: { title: string }) {
  const actions = homeConfig.quickActions.filter((a) => isEnabled(a.feature));
  return (
    <section>
      <SectionHeader title={title} />
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible">
        {actions.map((a) => (
          <a
            key={a.id}
            href={a.href}
            target={a.external ? "_blank" : undefined}
            rel={a.external ? "noopener noreferrer" : undefined}
            className="group relative flex w-44 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-line p-4 transition hover:-translate-y-0.5 hover:shadow-card lg:w-auto"
            style={{ background: a.gradient }}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-white/80 text-slate-800 shadow-sm">
              <Icon name={a.icon} className="size-5" />
            </span>
            <span className="mt-5 block text-slate-900">
              <span className="block text-xs font-medium opacity-70">{a.eyebrow}</span>
              <span className="block text-xl font-extrabold leading-tight">{a.title}</span>
              {a.subtitle ? <span className="block truncate text-xs opacity-75">{a.subtitle}</span> : null}
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-slate-900">
              {a.cta} <Icon name="arrow-right" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

const TILE_TINTS = [
  "bg-primary/8 text-primary-700 dark:text-primary-300",
  "bg-accent-500/10 text-accent-700 dark:text-accent-300",
  "bg-rx/8 text-rx",
  "bg-info/8 text-info",
  "bg-discount/8 text-discount",
  "bg-success/8 text-success",
];

export function CategoryTiles({ title, tree, limit = 18 }: { title: string; tree: CategoryNode[]; limit?: number }) {
  // Departments first, then their biggest subcategories to fill the grid.
  const subs = tree
    .flatMap((root) => root.children.map((c) => ({ ...c, type: root.type })))
    .filter((c) => c.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount);
  const tiles = [...tree, ...subs].slice(0, limit);
  return (
    <section>
      <SectionHeader title={title} href={routes.categories()} linkLabel={t("common.viewAll")} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-9">
        {tiles.map((c, i) => (
          <Link key={c.id} href={routes.category(c.slug)} className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-3 text-center transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card">
            <span className={cn("grid size-14 place-items-center rounded-2xl transition-transform group-hover:scale-105", TILE_TINTS[i % TILE_TINTS.length])}>
              <Icon name={departmentIcons[c.type ?? ""] ?? "package"} className="size-6" />
            </span>
            <span className="line-clamp-2 min-h-8 text-xs font-semibold leading-tight text-fg">{c.name}</span>
            <span className="text-[0.6875rem] text-fg-subtle">{c.productCount} items</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PromoBanners() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {homeConfig.promoBanners.filter((b) => isEnabled(b.href.includes("lab") ? "labTests" : "prescriptionUpload")).map((b) => (
        <Link
          key={b.id}
          href={b.href}
          className={cn(
            "group relative flex min-h-36 items-center overflow-hidden rounded-2xl p-6 text-white",
            b.tone === "primary" ? "bg-gradient-to-br from-primary-700 to-primary-500" : "bg-gradient-to-br from-accent-700 to-accent-500",
          )}
        >
          <div className="relative z-10 max-w-[65%]">
            <p className="text-xl font-extrabold leading-tight">{b.title}</p>
            <p className="mt-1 text-sm text-white/85">{b.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">
              Get started <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <HeroArt art={b.tone === "primary" ? "pills" : "devices"} className="absolute -right-4 bottom-0 h-40 w-auto" />
        </Link>
      ))}
    </section>
  );
}

export function BrandStrip({ title, brands }: { title: string; brands: Brand[] }) {
  if (!brands.length) return null;
  return (
    <section>
      <SectionHeader title={title} href={routes.brands()} linkLabel={t("common.viewAll")} />
      <Rail label={title}>
        {brands.map((b) => (
          <div key={b.id} className="w-36 shrink-0 snap-start md:w-40">
            <BrandTile brand={b} />
          </div>
        ))}
      </Rail>
    </section>
  );
}

export function ValueProps() {
  return (
    <section>
      <SectionHeader title={t("home.whyUs", { site: siteConfig.name })} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {siteConfig.valueProps.map((v) => (
          <div key={v.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary-600 dark:text-primary-300">
              <Icon name={v.icon} className="size-6" />
            </span>
            <div>
              <p className="font-bold text-fg">{v.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{v.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Steps() {
  return (
    <section className="rounded-3xl bg-primary-950 px-6 py-10 text-white md:px-10">
      <h2 className="text-center text-xl font-extrabold md:text-2xl">{t("home.orderIn3Steps")}</h2>
      <ol className="mt-8 grid gap-6 md:grid-cols-3">
        {homeConfig.steps.map((s) => (
          <li key={s.step} className="relative rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <span className="grid size-10 place-items-center rounded-full bg-accent-400 text-lg font-extrabold text-slate-900">{s.step}</span>
            <p className="mt-4 text-lg font-bold">{s.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/75">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex justify-center">
        <ButtonLink href={routes.uploadPrescription()} variant="accent" size="lg">
          <Icon name="file-up" className="size-5" /> {t("header.uploadPrescription")}
        </ButtonLink>
      </div>
    </section>
  );
}

/** Stat values may contain `{products}`, replaced with the live catalog size. */
export function Stats({ productCount }: { productCount: number }) {
  const approx = `${formatNumber(Math.floor(productCount / 100) * 100)}+`;
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {siteConfig.stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-line bg-surface p-5 text-center">
          <p className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">{s.value.replace("{products}", approx)}</p>
          <p className="mt-1 text-sm text-fg-muted">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

export function AppPromo() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 md:p-10">
      <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/10" />
      <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div className="max-w-xl">
          <h2 className="text-xl font-extrabold md:text-2xl">{t("home.downloadApp", { site: siteConfig.name })}</h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{t("home.appText")}</p>
          <ul className="mt-4 grid gap-2 text-sm text-fg sm:grid-cols-2">
            {["Refill reminders", "Order tracking", "Saved prescriptions", "App-only offers"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Icon name="circle-check" className="size-4 text-success" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={siteConfig.apps.android} variant="primary" target="_blank" rel="noopener noreferrer">
              <Icon name="smartphone" className="size-4" /> Android app
            </ButtonLink>
            <ButtonLink href={siteConfig.apps.ios} variant="outline" target="_blank" rel="noopener noreferrer">
              <Icon name="smartphone" className="size-4" /> iOS app
            </ButtonLink>
          </div>
        </div>
        <div aria-hidden className="mx-auto hidden h-64 w-36 rounded-[2rem] border-8 border-fg/90 bg-gradient-to-b from-primary-600 to-accent-500 p-3 shadow-pop md:block">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/40" />
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-white/90 p-1.5">
                <div className="size-6 rounded-md bg-primary/20" />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 w-3/4 rounded bg-slate-300" />
                  <div className="h-1.5 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeFaq() {
  return (
    <section className="grid gap-8 lg:grid-cols-[20rem_1fr]">
      <div>
        <h2 className="text-xl font-extrabold md:text-2xl">{t("home.faq")}</h2>
        <p className="mt-2 text-sm text-fg-muted">Can&apos;t find your answer? Call {siteConfig.contact.hotline} ({siteConfig.contact.supportHours}).</p>
        <ButtonLink href={routes.page("faqs")} variant="outline" size="sm" className="mt-4">
          All FAQs
        </ButtonLink>
      </div>
      <div className="rounded-2xl border border-line bg-surface px-5">
        {homeConfig.faqs.map((f, i) => (
          <Disclosure key={f.q} summary={f.q} defaultOpen={i === 0}>
            {f.a}
          </Disclosure>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: homeConfig.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </section>
  );
}

export function SeoContent({ tree }: { tree: CategoryNode[] }) {
  if (!features.seoContentBlock) return null;
  const c = siteConfig;
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 md:p-8">
      <div className="prose-app max-w-4xl text-sm">
        <h2>Order medicine and health essentials online in {c.country}</h2>
        <p>
          {c.name} brings a neighbourhood pharmacy, a beauty counter and a baby-care aisle together in one place. Search by brand or by generic name, compare pack
          sizes and per-unit prices, and have your order delivered to your door. Prices include VAT and you can pay by cash on delivery, mobile wallet or card.
        </p>
        <h3>Genuine products, checked by pharmacists</h3>
        <p>
          We buy directly from manufacturers and their authorised distributors, store products at the temperatures they require and dispense prescription medicines
          only after a licensed pharmacist has reviewed your prescription. Cold-chain items such as insulin travel in insulated packaging.
        </p>
        <h3>Delivery that fits your day</h3>
        <p>
          Orders inside Dhaka usually arrive within a day, with an express option for urgent needs, and we ship to every district in the country. You can track each
          order from your account and reorder your regular medicines in two taps.
        </p>
        <h3>Popular departments</h3>
        <p>
          {tree.slice(0, 10).map((d, i) => (
            <span key={d.id}>
              <Link href={routes.category(d.slug)}>{d.name}</Link>
              {i < Math.min(tree.length, 10) - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
