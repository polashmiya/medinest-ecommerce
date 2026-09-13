import type { ProductSummary } from "@/types";
import { SectionHeader } from "@/components/ui/display";
import { ProductCard } from "./product-card";
import { Rail } from "./rail";

/** Titled horizontal list of product cards. */
export function ProductRail({
  title,
  subtitle,
  href,
  products,
  accent,
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  products: ProductSummary[];
  accent?: "danger" | "primary";
  className?: string;
}) {
  if (!products.length) return null;
  return (
    <section className={className} aria-label={title}>
      <SectionHeader title={title} subtitle={subtitle} href={href} accent={accent} />
      <Rail label={title}>
        {products.map((p) => (
          <div key={p.id} className="rail-item snap-start">
            <ProductCard product={p} className="h-full" />
          </div>
        ))}
      </Rail>
    </section>
  );
}
