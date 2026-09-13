"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cartConfig, paymentConfig, type PaymentMethod } from "@/config/commerce.config";
import { deliveryOptionsFor, zoneById, zoneForDistrict } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { cn, uid } from "@/lib/utils";
import { unitLabel } from "@/services/catalog/summary";
import {
  useAddressStore, useAuthStore, useCartStore, useCartTotals, useDeliveryStore, useHydrated, useNotificationStore, useOrderStore,
} from "@/stores";
import type { Address, OrderItem } from "@/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Breadcrumbs, EmptyState, Skeleton } from "@/components/ui/display";
import { Checkbox, Textarea } from "@/components/ui/form";
import { Icon, type IconName } from "@/components/ui/icon";
import { CouponForm, TotalsTable } from "@/components/cart/cart-summary";
import { ProductImage } from "@/components/product/product-image";
import { AddressForm, emptyAddress, validateAddress, type AddressDraft, type AddressErrors } from "./address-form";
import { DeliveryWarning } from "./delivery-warning";
import { PaymentModal } from "./payment-modal";
import { PrescriptionPicker } from "./prescription-picker";
import { undeliverableLines } from "./restrictions";

const paymentIcon: Record<PaymentMethod["icon"], IconName> = { cash: "banknote", mobile: "smartphone", card: "credit-card" };

function Step({ n, title, children, id, done }: { n: number; title: ReactNode; children: ReactNode; id: string; done?: boolean }) {
  return (
    <section id={id} className="card scroll-mt-40 p-4 md:p-6" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="mb-4 flex items-center gap-3 text-base font-bold text-fg">
        <span className={cn("grid size-7 place-items-center rounded-full text-sm font-bold", done ? "bg-success text-white" : "bg-primary text-primary-fg")}>
          {done ? <Icon name="check" className="size-4" /> : n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function OptionCard({ checked, onSelect, name, value, children }: { checked: boolean; onSelect: () => void; name: string; value: string; children: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition", checked ? "border-primary-500 bg-primary/5 ring-2 ring-primary/15" : "border-line hover:border-primary-300")}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="mt-1 size-4 shrink-0 accent-[var(--p-600)]" />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card space-y-3 p-6">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
      <div className="card space-y-3 p-6">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}

type Errors = AddressErrors & { address?: string; prescription?: string; agree?: string; delivery?: string };

/**
 * Checkout entry: waits for local data, sends guests to login and shows an
 * empty state for an empty cart. The form itself mounts only once data is
 * ready, so its initial state can come straight from the stores.
 */
export function CheckoutView() {
  const t = useT();
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const lineCount = useCartStore((s) => s.lines.length);
  const [placedId, setPlacedId] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !user && !placedId) router.replace(routes.login(routes.checkout()));
  }, [hydrated, user, router, placedId]);

  if (placedId) {
    return (
      <div className="container-app grid min-h-[50vh] place-items-center py-16 text-center">
        <p className="flex items-center gap-2 text-sm text-fg-muted">
          <Icon name="loader" className="size-4 animate-spin" /> Opening your order…
        </p>
      </div>
    );
  }

  if (!hydrated || !user) {
    return (
      <div className="container-app py-8">
        <CheckoutSkeleton />
      </div>
    );
  }

  if (!lineCount) {
    return (
      <div className="container-app py-10">
        <div className="card">
          <EmptyState icon="shopping-bag" title={t("cart.empty")} text="Add a few products to your cart before checking out." action={<ButtonLink href={routes.categories()}>{t("cart.continueShopping")}</ButtonLink>} />
        </div>
      </div>
    );
  }

  return <CheckoutForm onPlaced={setPlacedId} />;
}

/**
 * Checkout: address → delivery option → payment → prescription (when needed)
 * → review. Everything is stored locally; `finalize` is the single point to
 * replace with an orders API call.
 */
function CheckoutForm({ onPlaced }: { onPlaced: (orderId: string) => void }) {
  const t = useT();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const lines = useCartStore((s) => s.lines);
  const deliveryOptionId = useCartStore((s) => s.deliveryOptionId);
  const paymentMethodId = useCartStore((s) => s.paymentMethodId);
  const setDeliveryOption = useCartStore((s) => s.setDeliveryOption);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const clearCart = useCartStore((s) => s.clear);
  const couponCode = useCartStore((s) => s.couponCode);
  const addresses = useAddressStore((s) => s.items);
  const saveAddressToBook = useAddressStore((s) => s.save);
  const zoneId = useDeliveryStore((s) => s.zoneId);
  const district = useDeliveryStore((s) => s.district);
  const setDistrict = useDeliveryStore((s) => s.setDistrict);
  const placeOrder = useOrderStore((s) => s.place);
  const notify = useNotificationStore((s) => s.push);
  const totalsWithCoupon = useCartTotals();

  // Default to the saved default address; otherwise a new address prefilled from the profile.
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => (addresses.find((a) => a.isDefault) ?? addresses[0])?.id ?? "new");
  const [draft, setDraft] = useState<AddressDraft>(() => ({ ...emptyAddress(district), name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "" }));
  const [saveNew, setSaveNew] = useState(true);
  const [prescriptionIds, setPrescriptionIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [payOpen, setPayOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  const selectedAddress: Address | null = selectedAddressId !== "new" ? addresses.find((a) => a.id === selectedAddressId) ?? null : null;

  // Keep the delivery zone in step with the chosen saved address (external store; idempotent).
  useEffect(() => {
    if (selectedAddress) setDistrict(selectedAddress.district, zoneForDistrict(selectedAddress.district).id);
  }, [selectedAddress, setDistrict]);

  const zone = zoneById(zoneId);
  const deliveryOptions = deliveryOptionsFor(zone);
  const activeOption = deliveryOptions.find((o) => o.id === deliveryOptionId) ?? deliveryOptions[0];
  const methods = paymentConfig.methods.filter((m) => m.enabled);
  const activeMethod = methods.find((m) => m.id === paymentMethodId) ?? methods[0];
  const needsRx = totalsWithCoupon.rxCount > 0 && cartConfig.requirePrescriptionForRx;
  const blocked = undeliverableLines(lines, zone);

  const chooseSaved = (a: Address) => {
    setSelectedAddressId(a.id);
    setErrors((e) => ({ ...e, address: undefined }));
  };
  const chooseNew = () => {
    setSelectedAddressId("new");
    setDistrict(draft.district, zoneForDistrict(draft.district).id);
  };
  const updateDraft = (next: AddressDraft) => {
    if (next.district !== draft.district) setDistrict(next.district, zoneForDistrict(next.district).id);
    setDraft(next);
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (selectedAddressId === "new") Object.assign(e, validateAddress(draft, { required: t("checkout.requiredField"), phone: t("checkout.invalidPhone") }));
    else if (!selectedAddress) e.address = "Choose a delivery address";
    if (needsRx && !prescriptionIds.length) e.prescription = t("checkout.prescriptionRequired");
    if (!agree) e.agree = "Please accept the terms & conditions";
    if (blocked.length) e.delivery = "Some items can't be delivered to this area";
    return e;
  };

  const finalize = () => {
    const address: Address = selectedAddress ?? { ...draft, email: draft.email || undefined, id: "", isDefault: false };
    const saved = !selectedAddress && saveNew ? saveAddressToBook({ ...address, id: undefined, isDefault: addresses.length === 0 }) : null;
    const { coupon, ...totals } = totalsWithCoupon;
    const items: OrderItem[] = lines.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      name: l.snapshot.name,
      image: l.snapshot.images[0] ?? "",
      qty: l.qty,
      unitLabel: unitLabel(l.snapshot),
      price: l.snapshot.price,
      mrp: l.snapshot.mrp,
      rxRequired: l.snapshot.rxRequired,
      slug: l.snapshot.slug,
      strength: l.snapshot.strength,
      form: l.snapshot.form,
      type: l.snapshot.type,
      brandName: l.snapshot.brandName,
    }));
    const order = placeOrder({
      items,
      totals,
      address: saved ?? { ...address, id: address.id || uid("A") },
      deliveryOptionId: activeOption?.id ?? deliveryOptionId,
      paymentMethodId: activeMethod.id,
      coupon: coupon ?? null,
      note: note.trim(),
      prescriptionIds: needsRx ? prescriptionIds : [],
    });
    notify({ title: "Order placed", body: `Your order ${order.id} (${formatPrice(order.totals.total)}) has been received.`, href: routes.order(order.id) });
    onPlaced(order.id);
    clearCart();
    router.replace(routes.orderSuccess(order.id));
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    const addressError = e.name || e.phone || e.street || e.area || e.district || e.email || e.address || e.delivery;
    const firstSection = addressError ? "co-address" : e.prescription ? "co-rx" : e.agree ? "co-review" : null;
    if (firstSection) {
      document.getElementById(firstSection)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setPlacing(true);
    if (activeMethod.id === "cod") finalize();
    else setPayOpen(true);
  };

  let n = 0;
  return (
    <div className="container-app py-6 md:py-8">
      <Breadcrumbs items={[{ label: t("common.home"), href: routes.home() }, { label: t("common.cart"), href: routes.cart() }, { label: t("checkout.title") }]} className="mb-4" />
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-fg">{t("checkout.title")}</h1>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <Step n={++n} id="co-address" title={t("checkout.deliveryAddress")} done={Boolean(selectedAddress)}>
            {addresses.length ? (
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <OptionCard key={a.id} name="address" value={a.id} checked={selectedAddressId === a.id} onSelect={() => chooseSaved(a)}>
                    <span className="flex items-center gap-2 text-sm font-bold text-fg">
                      {a.label}
                      {a.isDefault ? <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-primary-700 dark:text-primary-300">Default</span> : null}
                    </span>
                    <span className="mt-1 block text-sm text-fg">{a.name} · {a.phone}</span>
                    <span className="block text-xs text-fg-muted">{[a.street, a.area, a.district].filter(Boolean).join(", ")}</span>
                  </OptionCard>
                ))}
                <OptionCard name="address" value="new" checked={selectedAddressId === "new"} onSelect={chooseNew}>
                  <span className="flex items-center gap-2 text-sm font-bold text-fg">
                    <Icon name="plus" className="size-4 text-primary-600" /> {t("checkout.newAddress")}
                  </span>
                  <span className="block text-xs text-fg-muted">Deliver somewhere else</span>
                </OptionCard>
              </div>
            ) : null}
            {selectedAddressId === "new" ? (
              <div className={addresses.length ? "border-t border-line pt-4" : ""}>
                <AddressForm value={draft} onChange={updateDraft} errors={errors} idPrefix="co" />
                <Checkbox label={t("checkout.saveAddress")} checked={saveNew} onChange={(e) => setSaveNew(e.target.checked)} className="mt-4" />
              </div>
            ) : null}
            {errors.address ? <p className="mt-2 text-xs font-medium text-danger">{errors.address}</p> : null}
            <DeliveryWarning className="mt-4" />
          </Step>

          <Step n={++n} id="co-delivery" title={t("checkout.deliveryOption")} done>
            <p className="mb-3 text-xs text-fg-muted">
              Delivering to <span className="font-semibold text-fg">{district}</span> · {zone.label}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {deliveryOptions.map((o) => (
                <OptionCard key={o.id} name="delivery" value={o.id} checked={activeOption?.id === o.id} onSelect={() => setDeliveryOption(o.id)}>
                  <span className="flex items-center justify-between gap-2 text-sm font-bold text-fg">
                    {o.label}
                    <span className="text-xs font-semibold text-fg-muted">
                      {o.extraFee ? `+${formatPrice(o.extraFee)}` : zone.freeAbove !== null && totalsWithCoupon.subtotal >= zone.freeAbove ? t("common.free") : formatPrice(zone.fee)}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-fg-muted">{o.id === "express" ? o.description : `${zone.etaLabel} · ${o.description}`}</span>
                </OptionCard>
              ))}
            </div>
          </Step>

          <Step n={++n} id="co-payment" title={t("checkout.payment")} done>
            <div className="grid gap-3 sm:grid-cols-2">
              {methods.map((m) => (
                <OptionCard key={m.id} name="payment" value={m.id} checked={activeMethod.id === m.id} onSelect={() => setPaymentMethod(m.id)}>
                  <span className="flex items-center gap-2 text-sm font-bold text-fg">
                    <Icon name={paymentIcon[m.icon]} className="size-4 text-primary-600" />
                    {m.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-fg-muted">{m.description}</span>
                </OptionCard>
              ))}
            </div>
            {activeMethod.id !== "cod" ? <p className="mt-3 text-xs text-fg-subtle">You&apos;ll confirm the payment in the next step (demo gateway — nothing is charged).</p> : null}
          </Step>

          {needsRx ? (
            <Step n={++n} id="co-rx" title={t("checkout.prescription")} done={prescriptionIds.length > 0}>
              <p className="mb-4 flex items-start gap-2 rounded-xl bg-rx/8 p-3 text-sm text-fg">
                <Icon name="file-text" className="mt-0.5 size-4 shrink-0 text-rx" />
                <span>
                  {t("checkout.prescriptionRequired")}{" "}
                  <span className="text-fg-muted">
                    ({lines.filter((l) => l.snapshot.rxRequired).map((l) => l.snapshot.name).join(", ")})
                  </span>
                </span>
              </p>
              <PrescriptionPicker selected={prescriptionIds} onChange={(ids) => { setPrescriptionIds(ids); setErrors((e) => ({ ...e, prescription: undefined })); }} error={errors.prescription} />
            </Step>
          ) : null}

          <Step n={++n} id="co-review" title="Review & place order">
            <label htmlFor="co-note" className="mb-1.5 block text-sm font-semibold text-fg">
              {t("checkout.note")} <span className="font-normal text-fg-subtle">({t("common.optional")})</span>
            </label>
            <Textarea id="co-note" value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} placeholder={t("checkout.notePlaceholder")} rows={2} />
            <div className="mt-4">
              <Checkbox
                checked={agree}
                onChange={(e) => { setAgree(e.target.checked); setErrors((x) => ({ ...x, agree: undefined })); }}
                label={
                  <>
                    I agree to the{" "}
                    <Link href={routes.page("tos")} className="font-semibold text-primary-600 hover:underline" target="_blank">
                      terms & conditions
                    </Link>{" "}
                    and{" "}
                    <Link href={routes.page("return-policy")} className="font-semibold text-primary-600 hover:underline" target="_blank">
                      return policy
                    </Link>
                  </>
                }
              />
              {errors.agree ? <p className="mt-1.5 text-xs font-medium text-danger">{errors.agree}</p> : null}
            </div>
            {Object.values(errors).some(Boolean) ? (
              <p className="mt-4 rounded-lg bg-danger/8 px-3 py-2 text-sm font-medium text-danger" role="alert">
                Please fix the highlighted fields before placing your order.
              </p>
            ) : null}
            {/* Phones/tablets: a pinned action bar, like the checkout step of a native app. */}
            <div className="mobile-chrome fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-pop backdrop-blur lg:hidden">
              <div className="mx-auto flex max-w-2xl items-center gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-fg-muted">{t("cart.total")}</p>
                  <p className="text-lg font-extrabold leading-tight text-fg">{formatPrice(totalsWithCoupon.total)}</p>
                </div>
                <Button size="lg" className="flex-1" onClick={submit} loading={placing} disabled={blocked.length > 0}>
                  {placing ? t("checkout.placing") : t("checkout.placeOrder")}
                </Button>
              </div>
            </div>
          </Step>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-40">
          <div className="card p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-fg">{t("checkout.orderSummary")}</h2>
              <Link href={routes.cart()} className="text-xs font-semibold text-primary-600 hover:underline">
                {t("common.edit")}
              </Link>
            </div>
            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-line bg-muted">
                    <ProductImage product={l.snapshot} sizes="48px" />
                    <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-fg px-1 text-[0.625rem] font-bold text-bg">{l.qty}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">{l.snapshot.name}</span>
                    <span className="block truncate text-xs text-fg-subtle">{[l.snapshot.strength, unitLabel(l.snapshot)].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-fg">{formatPrice(l.snapshot.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-4 border-t border-line pt-4">
              <CouponForm />
              <TotalsTable />
              <Button size="lg" className="hidden w-full lg:flex" onClick={submit} loading={placing} disabled={blocked.length > 0}>
                {placing ? t("checkout.placing") : `${t("checkout.placeOrder")} · ${formatPrice(totalsWithCoupon.total)}`}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-fg-subtle">
                <Icon name="shield-check" className="size-3.5" /> Pharmacist-checked · 100% authentic products
              </p>
            </div>
          </div>
          {couponCode && !totalsWithCoupon.coupon ? <p className="text-center text-xs text-warning">Coupon {couponCode} no longer applies to this cart.</p> : null}
        </aside>
      </div>

      {payOpen && activeMethod.id !== "cod" ? (
        <PaymentModal
          method={activeMethod}
          amount={totalsWithCoupon.total}
          open
          onCancel={() => {
            setPayOpen(false);
            setPlacing(false);
          }}
          onPaid={() => {
            setPayOpen(false);
            finalize();
          }}
        />
      ) : null}
    </div>
  );
}
