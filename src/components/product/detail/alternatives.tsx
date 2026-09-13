import Link from "next/link";
import { features } from "@/config/features.config";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { unitLabel } from "@/services/catalog/summary";
import type { ProductSummary } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ProductImage } from "../product-image";

const perBase = (p: ProductSummary) => p.price / (p.unitMultiplier || 1);

function Compare({ alt, current }: { alt: ProductSummary; current: ProductSummary }) {
  const base = perBase(current);
  const diff = base ? Math.round(((perBase(alt) - base) / base) * 100) : 0;
  if (Math.abs(diff) < 1) return <Badge tone="neutral">{t("product.samePrice")}</Badge>;
  return diff < 0 ? <Badge tone="success">{t("product.cheaper", { percent: Math.abs(diff) })}</Badge> : <Badge tone="warning">{t("product.costlier", { percent: diff })}</Badge>;
}

/** Other brands with the same active ingredient and dosage form, compared per base unit. */
export function Alternatives({ current, items, genericName }: { current: ProductSummary; items: ProductSummary[]; genericName: string }) {
  if (!features.alternativeBrands || !items.length) return null;
  const unit = current.baseUnit ? current.baseUnit.toLowerCase() : "unit";
  return (
    <section id="alternatives" className="scroll-mt-40" aria-labelledby="alt-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="alt-title" className="text-xl font-extrabold tracking-tight text-fg">
            {t("product.alternativeBrands", { name: current.name })}
          </h2>
          <p className="mt-0.5 text-sm text-fg-muted">
            Same generic ({genericName}) and form. Prices compared per {unit}; ask your doctor or pharmacist before switching.
          </p>
        </div>
        <Link href={routes.search(genericName)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">
          {t("common.seeAll")} <Icon name="arrow-right" className="size-4" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="hidden bg-muted text-left text-xs uppercase tracking-wide text-fg-subtle md:table-header-group">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">{t("product.brand")}</th>
              <th scope="col" className="px-4 py-3 font-semibold">{t("product.manufacturer")}</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Price</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Per {unit}</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Compare</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((p) => (
              <tr key={p.id} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 md:table-row md:p-0">
                <td className="row-span-2 md:hidden">
                  <span className="block size-12 overflow-hidden rounded-lg bg-muted">
                    <ProductImage product={p} sizes="48px" />
                  </span>
                </td>
                <td className="min-w-0 md:px-4 md:py-3">
                  <Link href={routes.product(p.slug)} className="font-semibold text-fg hover:text-primary-600 hover:underline">
                    {p.name} {p.strength ? <span className="font-normal text-fg-muted">{p.strength}</span> : null}
                  </Link>
                  <span className="block text-xs text-fg-subtle">{unitLabel(p)}</span>
                </td>
                <td className="col-start-2 truncate text-xs text-fg-muted md:px-4 md:py-3 md:text-sm">{p.brandName}</td>
                <td className="col-start-3 row-start-1 text-right md:px-4 md:py-3">
                  <span className="font-bold text-fg">{formatPrice(p.price)}</span>
                  {p.mrp > p.price ? <del className="block text-xs text-fg-subtle">{formatPrice(p.mrp)}</del> : null}
                </td>
                <td className="hidden text-right text-fg-muted md:table-cell md:px-4 md:py-3">{formatPrice(perBase(p))}</td>
                <td className="col-start-3 row-start-2 text-right md:px-4 md:py-3">
                  <Compare alt={p} current={current} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
