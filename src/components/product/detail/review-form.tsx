"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { features } from "@/config/features.config";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { toast, useAuthStore, useReviewStore } from "@/stores";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/display";
import { Textarea } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";

/** Reviews this customer wrote on this device (mock persistence). */
export function UserReviews({ productId }: { productId: number }) {
  const all = useReviewStore((s) => s.items);
  const mine = all.filter((r) => r.productId === productId);
  if (!mine.length) return null;
  return (
    <ul className="divide-y divide-line border-b border-line">
      {mine.map((r) => (
        <li key={r.id} className="py-4">
          <div className="flex items-center gap-2">
            <Stars value={r.rating} size="xs" />
            <span className="text-sm font-semibold text-fg">{r.userName}</span>
            <Badge tone="primary">Your review</Badge>
          </div>
          {r.text ? <p className="mt-1.5 text-sm text-fg-muted">{r.text}</p> : null}
          <p className="mt-1 text-xs text-fg-subtle">{formatDate(r.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
}

export function ReviewForm({ productId, variantId }: { productId: number; variantId: number }) {
  const t = useT();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const add = useReviewStore((s) => s.add);
  const already = useReviewStore((s) => s.items.some((r) => r.productId === productId && user && r.userName === (user.name || user.phone)));
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!features.writeReviews) return null;

  if (!user) {
    return (
      <p className="rounded-xl bg-muted p-4 text-sm text-fg-muted">
        <Link href={routes.login(pathname)} rel="nofollow" className="font-semibold text-primary-600 hover:underline dark:text-primary-300">
          {t("common.login")}
        </Link>{" "}
        to share your experience with this product.
      </p>
    );
  }

  if (already) return <p className="rounded-xl bg-success/8 p-4 text-sm text-success">Thanks — your review is posted below.</p>;

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Icon name="star" className="size-4" /> {t("product.writeReview")}
      </Button>
    );
  }

  return (
    <form
      className="space-y-3 rounded-2xl border border-line p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!rating) return setError("Please choose a star rating.");
        add({ productId, variantId, rating, text: text.trim(), userName: user.name || user.phone, verified: false });
        toast({ tone: "success", title: "Review posted", description: "Thanks for helping other customers." });
        setOpen(false);
      }}
    >
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-fg">Your rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              onMouseEnter={() => setHover(n)}
              onClick={() => {
                setRating(n);
                setError(null);
              }}
              className="rounded p-0.5"
            >
              <Icon name="star" className={cn("size-7", (hover || rating) >= n ? "text-amber-400" : "text-line")} fill="currentColor" strokeWidth={0} />
            </button>
          ))}
        </div>
      </fieldset>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={600} placeholder="What did you like or dislike? How was the delivery?" aria-label="Review text" />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" size="sm">
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}
