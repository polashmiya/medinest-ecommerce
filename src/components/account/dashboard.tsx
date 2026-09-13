"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { isValidEmail } from "@/lib/utils";
import { orderProgress, toast, useAuthStore, useOrderStore, usePrescriptionStore, useWishlistStore } from "@/stores";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Field, Input } from "@/components/ui/form";
import { Icon, type IconName } from "@/components/ui/icon";
import { AccountHeading } from "./account-shell";
import { OrderItemThumb, StatusBadge } from "./order-bits";

function StatCard({ icon, label, value, href }: { icon: IconName; label: string; value: string | number; href?: string }) {
  const body = (
    <>
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary-600 dark:text-primary-300">
        <Icon name={icon} className="size-5" />
      </span>
      <span className="mt-3 block text-xl font-extrabold text-fg">{value}</span>
      <span className="block text-xs text-fg-muted">{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className="card block p-4 transition hover:border-primary-300">
      {body}
    </Link>
  ) : (
    <div className="card p-4">{body}</div>
  );
}

function ProfileCard() {
  const t = useT();
  const user = useAuthStore((s) => s.user)!;
  const update = useAuthStore((s) => s.update);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email ?? "");
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="card p-5" aria-labelledby="profile-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="profile-title" className="text-base font-bold text-fg">
          {t("account.profile")}
        </h2>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={() => { setName(user.name); setEmail(user.email ?? ""); setEditing(true); }}>
            <Icon name="settings" className="size-4" /> {t("common.edit")}
          </Button>
        ) : null}
      </div>
      {editing ? (
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (email && !isValidEmail(email)) return setError("Enter a valid email address");
            update({ name: name.trim(), email: email.trim() || undefined });
            setEditing(false);
            setError(null);
            toast({ tone: "success", title: "Profile updated" });
          }}
        >
          <Field label={t("checkout.name")} htmlFor="pf-name">
            <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label={t("checkout.email")} htmlFor="pf-email" error={error}>
            <Input id="pf-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} autoComplete="email" aria-invalid={Boolean(error)} />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">{t("common.save")}</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-fg-subtle">{t("checkout.name")}</dt>
            <dd className="mt-0.5 font-semibold text-fg">{user.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-subtle">{t("checkout.phone")}</dt>
            <dd className="mt-0.5 font-semibold text-fg">{user.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-subtle">{t("checkout.email")}</dt>
            <dd className="mt-0.5 truncate font-semibold text-fg">{user.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-subtle">Member since</dt>
            <dd className="mt-0.5 font-semibold text-fg">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

export function AccountDashboard() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const orders = useOrderStore((s) => s.orders);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const rxCount = usePrescriptionStore((s) => s.items.length);
  if (!user) return null;

  const active = orders.filter((o) => !["delivered", "cancelled"].includes(orderProgress(o).status)).length;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(user.referralCode);
      toast({ tone: "success", title: t("common.copied"), description: user.referralCode });
    } catch {
      toast({ tone: "error", title: "Couldn't copy — select the code and copy it manually." });
    }
  };

  return (
    <div className="space-y-5">
      <AccountHeading title={t("account.welcome", { name: user.name || "there" })} subtitle="Manage orders, prescriptions and saved details in one place." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon="package" label={`${t("account.orders")} · ${active} active`} value={orders.length} href={routes.orders()} />
        <StatCard icon="heart" label={t("account.wishlist")} value={wishlistCount} href={routes.wishlist()} />
        <StatCard icon="file-text" label={t("account.prescriptions")} value={rxCount} href={routes.prescriptions()} />
        <StatCard icon="wallet" label={t("account.cashBalance")} value={formatPrice(user.cashBalance)} />
      </div>

      <section className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/10 to-accent-500/10 p-5">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-fg">
            <Icon name="gift" className="size-4 text-primary-600" /> {t("account.referral")}
          </p>
          <p className="mt-0.5 text-sm text-fg-muted">Share your code — friends get a discount on their first order and you earn cash balance.</p>
        </div>
        <div className="flex items-center gap-2">
          <code className="rounded-lg border border-dashed border-primary-400 bg-surface px-3 py-2 font-mono text-sm font-bold text-fg">{user.referralCode}</code>
          <Button variant="outline" size="sm" onClick={copy}>
            <Icon name="copy" className="size-4" /> Copy
          </Button>
        </div>
      </section>

      <ProfileCard />

      <section className="card p-5" aria-labelledby="recent-orders">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-orders" className="text-base font-bold text-fg">
            Recent orders
          </h2>
          {orders.length ? (
            <Link href={routes.orders()} className="text-sm font-semibold text-primary-600 hover:underline">
              {t("common.viewAll")}
            </Link>
          ) : null}
        </div>
        {orders.length ? (
          <ul className="divide-y divide-line">
            {orders.slice(0, 3).map((o) => {
              const { status } = orderProgress(o);
              return (
                <li key={o.id}>
                  <Link href={routes.order(o.id)} className="flex items-center gap-3 py-3 hover:bg-muted/50">
                    <div className="flex -space-x-3">
                      {o.items.slice(0, 3).map((it) => (
                        <OrderItemThumb key={`${it.productId}-${it.variantId}`} item={it} className="size-11 ring-2 ring-surface" />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-bold text-fg">{o.id}</p>
                      <p className="text-xs text-fg-muted">
                        {formatDate(o.createdAt)} · {o.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={status} />
                      <p className="mt-1 text-sm font-bold text-fg">{formatPrice(o.totals.total)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon="package" title={t("account.noOrders")} action={<ButtonLink href={routes.categories()}>Start shopping</ButtonLink>} className="py-8" />
        )}
      </section>
    </div>
  );
}
