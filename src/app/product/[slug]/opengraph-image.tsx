import { ImageResponse } from "next/og";
import { currencyConfig } from "@/config/commerce.config";
import { siteConfig } from "@/config/site.config";
import { colorPresets, themeConfig } from "@/config/theme.config";
import { formatPrice } from "@/lib/format";
import { catalog, defaultVariant } from "@/services/catalog";
import { productArtSvg } from "@/components/product/product-art";

export const alt = `Product on ${siteConfig.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const preset = colorPresets.find((p) => p.id === themeConfig.defaultColorPreset) ?? colorPresets[0];

/**
 * Share card for a product page. Text is drawn by the image renderer itself;
 * the pack illustration is embedded without its labels (embedded SVG text
 * cannot use the renderer's fonts). Prices use the ISO currency code because
 * the bundled font has no glyph for the local currency symbol.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await catalog.getProductBySlug(slug);

  if (!product) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: preset.primary[900], color: "#fff", fontSize: 64, fontWeight: 700 }}>
          {siteConfig.name}
        </div>
      ),
      size,
    );
  }

  const v = defaultVariant(product);
  const art = productArtSvg(product, { standalone: true }).replace(/<text[\s\S]*?<\/text>/g, "");
  const artSrc = `data:image/svg+xml;base64,${Buffer.from(art).toString("base64")}`;
  const money = (n: number) => `${currencyConfig.code} ${formatPrice(n, { symbol: false })}`;
  const subtitle = [product.form, product.strength].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `linear-gradient(135deg, ${preset.primary[950]} 0%, ${preset.primary[700]} 100%)`,
          padding: 56,
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: preset.primary[600], fontSize: 28, fontWeight: 800 }}>+</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{siteConfig.name}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 56 }}>
            {product.brandName ? <div style={{ fontSize: 24, opacity: 0.75, textTransform: "uppercase", letterSpacing: 2 }}>{product.brandName}</div> : null}
            <div style={{ fontSize: product.name.length > 28 ? 58 : 72, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>{product.name}</div>
            {subtitle ? <div style={{ fontSize: 32, opacity: 0.85, marginTop: 14 }}>{subtitle}</div> : null}
            {/* Satori needs a single text child (or display:flex), so interpolate into one string. */}
            {product.genericName ? <div style={{ fontSize: 26, opacity: 0.7, marginTop: 8 }}>{`Generic: ${product.genericName}`}</div> : null}
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: "auto" }}>
            <div style={{ fontSize: 60, fontWeight: 800 }}>{money(v.price)}</div>
            {v.mrp > v.price ? <div style={{ fontSize: 30, opacity: 0.6, textDecoration: "line-through", marginBottom: 10 }}>{money(v.mrp)}</div> : null}
            {v.discountPercent > 0 ? (
              <div style={{ display: "flex", fontSize: 26, fontWeight: 800, background: preset.accent[400], color: preset.accent[950], borderRadius: 999, padding: "6px 18px", marginBottom: 12 }}>
                {`${v.discountPercent}% OFF`}
              </div>
            ) : null}
          </div>
          <div style={{ fontSize: 24, opacity: 0.7, marginTop: 10 }}>
            {`${v.salesUnit ? `Per ${v.salesUnit.toLowerCase()} · ` : ""}Home delivery across ${siteConfig.country}`}
          </div>
        </div>

        <div style={{ width: 460, height: 518, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: 36 }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={artSrc} width={420} height={420} style={{ borderRadius: 24 }} />
        </div>
      </div>
    ),
    size,
  );
}
