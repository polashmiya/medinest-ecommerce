import Link from "next/link";
import { t } from "@/lib/i18n";

export interface SpecRow {
  label: string;
  value: string;
  href?: string;
}

/** Key facts as a two-column table. Rows without a value are skipped. */
export function ProductSpecs({ rows }: { rows: SpecRow[] }) {
  const filled = rows.filter((r) => r.value);
  if (!filled.length) return null;
  return (
    <section id="specs" className="scroll-mt-40" aria-labelledby="specs-title">
      <h2 id="specs-title" className="mb-4 text-xl font-extrabold tracking-tight text-fg">
        {t("product.specs")}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-line">
            {filled.map((r) => (
              <tr key={r.label} className="even:bg-muted/50">
                <th scope="row" className="w-2/5 px-4 py-3 text-left font-semibold text-fg md:w-1/3">
                  {r.label}
                </th>
                <td className="px-4 py-3 text-fg-muted">
                  {r.href ? (
                    <Link href={r.href} className="font-medium text-primary-600 hover:underline dark:text-primary-300">
                      {r.value}
                    </Link>
                  ) : (
                    r.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
