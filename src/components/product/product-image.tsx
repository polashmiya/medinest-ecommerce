import Image from "next/image";
import { catalogConfig } from "@/config/catalog.config";
import { cn } from "@/lib/utils";
import { productArtSvg, type ArtInput } from "./product-art";

type ImageProduct = ArtInput & { images?: string[] };

/** Resolve a stored image path against the configured CDN / base URL. */
export function imageUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${catalogConfig.images.baseUrl}${path}`;
}

/** URL of the generated illustration (served by app/art/product/[id]/route.ts). */
export const productArtUrl = (id: number) => `/art/product/${id}`;

/**
 * Product visual. Uses the product photo when the catalog provides one;
 * otherwise the generated illustration — as a lazy, cacheable <img> by
 * default, or inlined (`inline`) where an extra request is undesirable.
 */
export function ProductImage({
  product,
  sizes = catalogConfig.images.cardSizes,
  priority,
  inline,
  className,
}: {
  product: ImageProduct;
  sizes?: string;
  priority?: boolean;
  inline?: boolean;
  className?: string;
}) {
  const photo = product.images?.[0];
  if (photo) {
    return (
      <span className={cn("relative block size-full", className)}>
        <Image src={imageUrl(photo)} alt={product.name} fill sizes={sizes} priority={priority} quality={catalogConfig.images.quality} className="object-contain p-2" />
      </span>
    );
  }
  if (inline) {
    return <span className={cn("block size-full [&>svg]:block [&>svg]:size-full", className)} dangerouslySetInnerHTML={{ __html: productArtSvg(product) }} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- generated SVG; the image optimizer adds nothing here
    <img
      src={productArtUrl(product.id)}
      alt={[product.name, product.strength].filter(Boolean).join(" ")}
      width={240}
      height={240}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("block size-full object-cover", className)}
    />
  );
}
