import { features } from "@/config/features.config";
import { formatDate } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Review } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ReviewForm, UserReviews } from "./review-form";

function ReviewItem({ r }: { r: Review }) {
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary-700 dark:text-primary-300">{r.userName.slice(0, 1)}</span>
        <span className="text-sm font-semibold text-fg">{r.userName}</span>
        {r.verified ? (
          <Badge tone="success">
            <Icon name="badge-check" className="size-3" /> Verified purchase
          </Badge>
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Stars value={r.rating} size="xs" />
        <span className="text-xs text-fg-subtle">{formatDate(r.createdAt)}</span>
      </div>
      {r.text ? <p className="mt-1.5 text-sm text-fg-muted">{r.text}</p> : null}
    </li>
  );
}

/** Rating summary, distribution bars and review list (first few visible, rest collapsible). */
export function ReviewsSection({
  productId,
  variantId,
  average,
  count,
  reviews,
}: {
  productId: number;
  variantId: number;
  average: number;
  count: number;
  reviews: Review[];
}) {
  if (!features.reviews) return null;
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));
  const sample = Math.max(1, reviews.length);
  const visible = reviews.slice(0, 6);
  const rest = reviews.slice(6);

  return (
    <section id="reviews" className="scroll-mt-40" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="mb-4 text-xl font-extrabold tracking-tight text-fg">
        {t("product.reviews")}
      </h2>
      <div className="grid gap-6 md:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="rounded-2xl border border-line bg-surface p-5">
          {count ? (
            <>
              <p className="text-4xl font-extrabold text-fg">{average.toFixed(1)}</p>
              <Stars value={average} size="md" className="mt-1" />
              <p className="mt-1 text-xs text-fg-muted">{t("product.basedOn", { count })}</p>
              <ul className="mt-4 space-y-1.5">
                {dist.map((d) => (
                  <li key={d.star} className="flex items-center gap-2 text-xs text-fg-muted">
                    <span className="w-3 text-right font-semibold">{d.star}</span>
                    <Icon name="star" className="size-3 text-amber-400" fill="currentColor" strokeWidth={0} />
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-amber-400" style={{ width: `${Math.round((d.n / sample) * 100)}%` }} />
                    </span>
                    <span className="w-8 text-right">{Math.round((d.n / sample) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-fg-muted">{t("product.noReviews")}</p>
          )}
          <div className="mt-5">
            <ReviewForm productId={productId} variantId={variantId} />
          </div>
        </div>

        <div className="min-w-0">
          <UserReviews productId={productId} />
          {visible.length ? (
            <ul className="divide-y divide-line">
              {visible.map((r) => (
                <ReviewItem key={r.id} r={r} />
              ))}
            </ul>
          ) : null}
          {rest.length ? (
            <details className="group border-t border-line">
              <summary className="flex cursor-pointer list-none items-center gap-1 py-3 text-sm font-semibold text-primary-600 dark:text-primary-300 [&::-webkit-details-marker]:hidden">
                {t("common.showMore")} ({rest.length})
                <Icon name="chevron-down" className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="divide-y divide-line">
                {rest.map((r) => (
                  <ReviewItem key={r.id} r={r} />
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      </div>
    </section>
  );
}
