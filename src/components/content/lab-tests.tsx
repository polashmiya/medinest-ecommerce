"use client";

import { useMemo, useState } from "react";
import { formatPrice, percentOff } from "@/lib/format";
import { cn, isValidBdPhone } from "@/lib/utils";
import { toast, useAuthStore } from "@/stores";
import type { LabPackage, LabTest } from "@/services/content/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";
import { CoverArtwork } from "./content-ui";
import { recordKeys, saveRecord, upcomingDays } from "./local-records";

export interface LabServiceInfo {
  collectionFee: number;
  freeCollectionAbove: number;
  timeSlots: string[];
  bookingDays: number;
}

interface BookingItem {
  id: number;
  name: string;
  price: number;
  mrp: number;
  kind: "test" | "package";
}

export function LabTestCatalog({ tests, packages, categories, service }: { tests: LabTest[]; packages: LabPackage[]; categories: readonly string[]; service: LabServiceInfo }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [booking, setBooking] = useState<BookingItem[] | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter(
      (t) =>
        (!category || t.category === category) &&
        (!q || t.name.toLowerCase().includes(q) || t.includes.some((i) => i.toLowerCase().includes(q)) || t.category.toLowerCase().includes(q)),
    );
  }, [tests, query, category]);

  const chosen = tests.filter((t) => selected.includes(t.id));
  const total = chosen.reduce((s, t) => s + t.price, 0);
  const toggle = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <section className="mt-10" aria-labelledby="packages-title">
        <h2 id="packages-title" className="mb-4 text-lg font-extrabold tracking-tight text-fg md:text-xl">
          Health check packages
        </h2>
        <div className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
          {packages.map((p) => (
            <article key={p.id} className="card flex w-72 shrink-0 snap-start flex-col overflow-hidden">
              <CoverArtwork cover={p.cover} className="h-28" iconClassName="size-8">
                <div className="p-4">
                  <Badge className="bg-white/20 text-white">{p.parameters} parameters</Badge>
                  <h3 className="mt-2 text-lg font-extrabold">{p.name}</h3>
                </div>
              </CoverArtwork>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs text-fg-muted">{p.forWhom}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.tests.map((t) => (
                    <li key={t} className="rounded-md bg-muted px-2 py-1 text-[0.6875rem] font-medium text-fg-muted">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  <div>
                    <p className="text-lg font-extrabold text-fg">{formatPrice(p.price)}</p>
                    <p className="text-xs">
                      <del className="text-fg-subtle">{formatPrice(p.mrp)}</del> <span className="font-bold text-success">{percentOff(p.mrp, p.price)}% off</span>
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setBooking([{ id: p.id, name: p.name, price: p.price, mrp: p.mrp, kind: "package" }])}>
                    Book
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="tests-title">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="tests-title" className="text-lg font-extrabold tracking-tight text-fg md:text-xl">
              Individual tests
            </h2>
            <p className="text-sm text-fg-muted">Select one or more tests and book a single home sample collection.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tests, e.g. thyroid, sugar" className="pl-10" aria-label="Search lab tests" />
          </div>
        </div>
        <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1">
          {[null, ...categories].map((c) => (
            <button
              key={c ?? "all"}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn("whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition", category === c ? "border-primary bg-primary text-primary-fg" : "border-line bg-surface text-fg-muted hover:border-primary-300")}
            >
              {c ?? "All tests"}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => {
              const on = selected.includes(t.id);
              return (
                <article key={t.id} className={cn("card flex flex-col p-5 transition", on && "border-primary-500 ring-2 ring-primary/15")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        <Badge tone="primary">{t.category}</Badge>
                        {t.popular ? <Badge tone="accent">Popular</Badge> : null}
                      </div>
                      <h3 className="font-bold leading-snug text-fg">{t.name}</h3>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary-600">
                      <Icon name={t.sampleType === "Urine" ? "flask-conical" : "droplet"} className="size-5" />
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-muted px-2.5 py-2">
                      <dt className="text-fg-subtle">Sample</dt>
                      <dd className="font-semibold text-fg">{t.sampleType}</dd>
                    </div>
                    <div className="rounded-lg bg-muted px-2.5 py-2">
                      <dt className="text-fg-subtle">Report in</dt>
                      <dd className="font-semibold text-fg">{t.reportIn}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 flex items-start gap-1.5 text-xs text-fg-muted">
                    <Icon name="info" className="mt-0.5 size-3.5 shrink-0" /> {t.preparation}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-fg-subtle">Includes: {t.includes.join(", ")}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div>
                      <p className="text-lg font-extrabold text-fg">{formatPrice(t.price)}</p>
                      {t.mrp > t.price ? (
                        <p className="text-xs">
                          <del className="text-fg-subtle">{formatPrice(t.mrp)}</del> <span className="font-bold text-success">{percentOff(t.mrp, t.price)}% off</span>
                        </p>
                      ) : null}
                    </div>
                    <Button size="sm" variant={on ? "primary" : "secondary"} onClick={() => toggle(t.id)} aria-pressed={on}>
                      <Icon name={on ? "check" : "plus"} className="size-4" /> {on ? "Added" : "Add"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="microscope" title="No tests found" text="Try a different search term or category." />
        )}
      </section>

      {chosen.length ? (
        <div className="mobile-chrome fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 px-4 md:bottom-6">
          <div className="mx-auto flex max-w-2xl animate-pop items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-3 pl-5 shadow-pop">
            <div className="min-w-0">
              <p className="text-sm font-bold text-fg">
                {chosen.length} test{chosen.length > 1 ? "s" : ""} selected · {formatPrice(total)}
              </p>
              <p className="truncate text-xs text-fg-muted">{chosen.map((t) => t.name).join(", ")}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                Clear
              </Button>
              <Button size="sm" onClick={() => setBooking(chosen.map((t) => ({ id: t.id, name: t.name, price: t.price, mrp: t.mrp, kind: "test" })))}>
                Book home collection
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <LabBookingModal items={booking} service={service} onClose={() => setBooking(null)} onBooked={() => setSelected([])} />
    </>
  );
}

function LabBookingModal({ items, service, onClose, onBooked }: { items: BookingItem[] | null; service: LabServiceInfo; onClose: () => void; onBooked: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ name: "", phone: "", address: "", area: "", date: "", slot: service.timeSlots[0] ?? "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  // Only rendered in the browser (the modal is closed during SSR), so local dates are safe.
  const [days] = useState(() => (typeof window === "undefined" ? [] : upcomingDays(service.bookingDays, 1)));
  const open = items !== null;

  // Reset and prefill each time the modal opens.
  const [openedFor, setOpenedFor] = useState<BookingItem[] | null>(null);
  if (items !== openedFor) {
    setOpenedFor(items);
    if (items) {
      setForm((f) => ({ ...f, name: f.name || user?.name || "", phone: f.phone || user?.phone || "", date: f.date || days[0]?.value || "" }));
      setErrors({});
      setDone(null);
    }
  }

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const subtotal = (items ?? []).reduce((s, i) => s + i.price, 0);
  const mrp = (items ?? []).reduce((s, i) => s + i.mrp, 0);
  const fee = subtotal >= service.freeCollectionAbove ? 0 : service.collectionFee;
  const total = subtotal + fee;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Please enter the patient's name.";
    if (!isValidBdPhone(form.phone)) errs.phone = "Enter a valid mobile number, e.g. 01XXXXXXXXX.";
    if (!form.address.trim()) errs.address = "Please enter the collection address.";
    if (!form.date) errs.date = "Choose a date.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const rec = saveRecord(recordKeys.labBookings, { ...form, items, subtotal, collectionFee: fee, total });
    toast({ tone: "success", title: "Sample collection booked", description: `Booking ${rec.id}` });
    setDone(rec.id);
    onBooked();
  };

  return (
    <Modal open={open} onClose={onClose} title={done ? "Booking confirmed" : "Book home sample collection"}>
      {done ? (
        <div className="py-2 text-center">
          <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-success/12 text-success">
            <Icon name="circle-check" className="size-7" />
          </span>
          <p className="font-bold text-fg">Booking {done}</p>
          <p className="mt-1 text-sm text-fg-muted">
            A phlebotomist will call {form.phone} to confirm the {form.slot} slot on {days.find((d) => d.value === form.date)?.label ?? form.date}.
          </p>
          <p className="mt-3 rounded-lg bg-muted p-2 text-xs text-fg-subtle">Demo storefront: the booking is saved on this device only.</p>
          <Button className="mt-5" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="rounded-xl bg-muted p-3">
            <ul className="space-y-1 text-sm">
              {(items ?? []).map((i) => (
                <li key={`${i.kind}-${i.id}`} className="flex justify-between gap-3">
                  <span className="truncate text-fg">{i.name}</span>
                  <span className="shrink-0 font-semibold">{formatPrice(i.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between border-t border-line pt-2 text-sm">
              <span className="text-fg-muted">Home collection</span>
              <span className={fee ? "font-semibold" : "font-semibold text-success"}>{fee ? formatPrice(fee) : "Free"}</span>
            </p>
            <p className="mt-1 flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>
                {mrp > subtotal ? <del className="mr-1.5 font-normal text-fg-subtle">{formatPrice(mrp + fee)}</del> : null}
                {formatPrice(total)}
              </span>
            </p>
            {fee ? <p className="mt-1 text-xs text-fg-subtle">Free home collection on bookings over {formatPrice(service.freeCollectionAbove)}.</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Patient name" htmlFor="lab-name" error={errors.name} required>
              <Input id="lab-name" value={form.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} autoComplete="name" data-autofocus />
            </Field>
            <Field label="Mobile number" htmlFor="lab-phone" error={errors.phone} required>
              <Input id="lab-phone" value={form.phone} onChange={set("phone")} aria-invalid={Boolean(errors.phone)} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
            </Field>
          </div>
          <Field label="Collection address" htmlFor="lab-address" error={errors.address} required>
            <Input id="lab-address" value={form.address} onChange={set("address")} aria-invalid={Boolean(errors.address)} autoComplete="street-address" placeholder="House, road, block" />
          </Field>
          <Field label="Area / Thana" htmlFor="lab-area">
            <Input id="lab-area" value={form.area} onChange={set("area")} placeholder="e.g. Dhanmondi" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Preferred date" htmlFor="lab-date" error={errors.date} required>
              <Select id="lab-date" value={form.date} onChange={set("date")}>
                {days.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Time slot" htmlFor="lab-slot" required>
              <Select id="lab-slot" value={form.slot} onChange={set("slot")}>
                {service.timeSlots.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Note" htmlFor="lab-note" hint="Optional — landmarks, fasting status, etc.">
            <Textarea id="lab-note" value={form.note} onChange={set("note")} className="min-h-16" maxLength={300} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Confirm booking</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
