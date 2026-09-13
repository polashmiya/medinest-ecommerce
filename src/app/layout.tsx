import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter, Manrope, Plus_Jakarta_Sans, Roboto } from "next/font/google";
import { cartConfig } from "@/config/commerce.config";
import { features } from "@/config/features.config";
import { seoConfig } from "@/config/seo.config";
import { defaultUiSettings } from "@/config/settings.config";
import { siteConfig } from "@/config/site.config";
import { bootScript, buildThemeCss } from "@/lib/theme/theme-css";
import { catalog } from "@/services/catalog";
import { AppProviders } from "@/components/providers/app-providers";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SettingsPanel } from "@/components/layout/settings-panel";
import { JsonLd } from "@/components/ui/display";
import "./globals.css";

// Every font offered in the display settings. Only the default one is preloaded.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", preload: false });
const dmsans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans", display: "swap", preload: false });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--font-roboto", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: seoConfig.defaultTitle, template: seoConfig.titleTemplate },
  description: seoConfig.defaultDescription,
  keywords: seoConfig.keywords,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
  },
  twitter: { card: "summary_large_image", site: seoConfig.twitterHandle },
  robots: { index: seoConfig.robots.index, follow: seoConfig.robots.follow },
  formatDetection: { telephone: false },
  // "Add to Home Screen" on iOS opens full-screen, like an installed app.
  appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets content use the full screen on notched phones; fixed bars pad with env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const tree = await catalog.getCategoryTree();
  const navCategories = tree.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    type: c.type,
    children: c.children.map((ch) => ({ id: ch.id, name: ch.name, slug: ch.slug })),
  }));
  const s = defaultUiSettings;

  return (
    <html
      lang={siteConfig.language}
      className={`${jakarta.variable} ${inter.variable} ${manrope.variable} ${dmsans.variable} ${roboto.variable}`}
      data-mode="light"
      data-color={s.colorPreset}
      data-font={s.font}
      data-card-style={s.cardStyle}
      data-sticky-header={String(s.stickyHeader)}
      data-listing-view={s.listingView}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: buildThemeCss() }} />
        <script dangerouslySetInnerHTML={{ __html: bootScript(cartConfig.storageKeys.settings) }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main" className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 font-semibold text-primary-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <AppProviders>
          <Header tree={tree} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer tree={tree} />
          <MobileBottomNav />
          <CartDrawer />
          <SettingsPanel />
          <MobileMenu categories={navCategories} />
        </AppProviders>
        {features.jsonLd ? (
          <JsonLd
            data={[
              {
                "@context": "https://schema.org",
                "@type": seoConfig.organization.type,
                name: siteConfig.name,
                legalName: siteConfig.legalName,
                url: siteConfig.url,
                telephone: siteConfig.contact.hotline,
                email: siteConfig.contact.email,
                address: { "@type": "PostalAddress", streetAddress: siteConfig.contact.address, addressCountry: siteConfig.countryCode },
                sameAs: seoConfig.organization.sameAs,
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: siteConfig.name,
                url: siteConfig.url,
                potentialAction: { "@type": "SearchAction", target: `${siteConfig.url}/search?q={search_term_string}`, "query-input": "required name=search_term_string" },
              },
            ]}
          />
        ) : null}
      </body>
    </html>
  );
}
