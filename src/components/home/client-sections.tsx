"use client";

import { useState } from "react";
import { features } from "@/config/features.config";
import { useT } from "@/lib/use-t";
import { isValidEmail } from "@/lib/utils";
import { toast, useRecentStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { ProductCard } from "@/components/product/product-card";
import { Rail } from "@/components/product/rail";
import { SectionHeader } from "@/components/ui/display";

const NEWSLETTER_KEY = "medinest.newsletter.v1";

export function Newsletter() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  if (!features.newsletter) return null;
  return (
    <section className="rounded-3xl bg-gradient-to-br from-primary-700 to-primary-500 p-6 text-white md:p-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
          <Icon name="mail" className="size-6" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold md:text-2xl">{t("home.newsletter")}</h2>
        <p className="mt-1 text-sm text-white/85">{t("home.newsletterText")}</p>
        {done ? (
          <p className="mt-6 flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold">
            <Icon name="circle-check" className="size-5" /> {t("home.subscribed")}
          </p>
        ) : (
          <form
            className="mt-6 flex w-full max-w-md flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isValidEmail(email)) return setError("Please enter a valid email address.");
              try {
                const list = JSON.parse(localStorage.getItem(NEWSLETTER_KEY) ?? "[]") as string[];
                localStorage.setItem(NEWSLETTER_KEY, JSON.stringify([...new Set([...list, email.toLowerCase()])]));
              } catch {
                /* storage unavailable */
              }
              setDone(true);
              toast({ tone: "success", title: t("home.subscribed") });
            }}
          >
            <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} placeholder={t("home.emailPlaceholder")} aria-label="Email address" aria-invalid={Boolean(error)} className="border-white/30 bg-white/95 text-slate-900" />
            <Button type="submit" variant="accent" className="shrink-0">
              {t("home.subscribe")}
            </Button>
          </form>
        )}
        {error ? <p className="mt-2 text-xs font-semibold text-white">{error}</p> : null}
      </div>
    </section>
  );
}

/** Products the shopper looked at recently (stored on the device). */
export function RecentlyViewedRail({ title = "Recently viewed" }: { title?: string }) {
  const items = useRecentStore((s) => s.items);
  const clear = useRecentStore((s) => s.clear);
  if (!features.recentlyViewed || !items.length) return null;
  return (
    <section aria-label={title}>
      <div className="flex items-start justify-between">
        <SectionHeader title={title} />
        <button type="button" onClick={clear} className="text-xs font-semibold text-fg-subtle hover:text-danger">
          Clear
        </button>
      </div>
      <Rail label={title}>
        {items.map((p) => (
          <div key={p.id} className="rail-item snap-start">
            <ProductCard product={p} className="h-full" />
          </div>
        ))}
      </Rail>
    </section>
  );
}
