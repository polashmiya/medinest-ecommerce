"use client";

import { useMemo, useState } from "react";
import { formatCompact, formatPrice } from "@/lib/format";
import { cn, isValidBdPhone } from "@/lib/utils";
import { toast, useAuthStore } from "@/stores";
import type { Doctor, DoctorSpecialty } from "@/services/content/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";
import { recordKeys, saveRecord } from "./local-records";

export function DoctorDirectory({ doctors, specialties }: { doctors: Doctor[]; specialties: DoctorSpecialty[] }) {
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [booking, setBooking] = useState<Doctor | null>(null);
  const bySpecialty = useMemo(() => Object.fromEntries(specialties.map((s) => [s.id, s])), [specialties]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter(
      (d) =>
        (!specialty || d.specialtyId === specialty) &&
        (!q || d.name.toLowerCase().includes(q) || bySpecialty[d.specialtyId]?.name.toLowerCase().includes(q) || d.qualifications.toLowerCase().includes(q)),
    );
  }, [doctors, specialty, query, bySpecialty]);

  return (
    <>
      <section className="mt-10" aria-labelledby="specialties-title">
        <h2 id="specialties-title" className="mb-4 text-lg font-extrabold tracking-tight text-fg md:text-xl">
          Consult by specialty
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {specialties.map((s) => {
            const on = specialty === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => setSpecialty(on ? null : s.id)}
                className={cn("card flex flex-col items-start gap-2 p-4 text-left transition hover:border-primary-300", on && "border-primary-500 ring-2 ring-primary/20")}
              >
                <span className={cn("grid size-10 place-items-center rounded-xl", on ? "bg-primary text-primary-fg" : "bg-primary/10 text-primary-600 dark:text-primary-300")}>
                  <Icon name={s.icon} className="size-5" />
                </span>
                <span className="text-sm font-bold text-fg">{s.name}</span>
                <span className="line-clamp-2 text-xs text-fg-muted">{s.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="doctors-title">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="doctors-title" className="text-lg font-extrabold tracking-tight text-fg md:text-xl">
              {specialty ? bySpecialty[specialty]?.name : "Available doctors"}
            </h2>
            <p className="text-sm text-fg-muted">{list.length} doctors available for video consultation</p>
          </div>
          <div className="flex items-center gap-2">
            {specialty ? (
              <Button variant="ghost" size="sm" onClick={() => setSpecialty(null)}>
                <Icon name="x" className="size-4" /> Clear filter
              </Button>
            ) : null}
            <div className="relative w-full md:w-72">
              <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
              <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search doctor or specialty" className="pl-10" aria-label="Search doctors" />
            </div>
          </div>
        </div>

        {list.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((d) => (
              <article key={d.id} className="card flex flex-col p-5">
                <div className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-lg font-extrabold text-white" aria-hidden>
                    {d.initials}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold leading-snug text-fg">{d.name}</h3>
                    <p className="text-xs text-fg-muted">{d.qualifications}</p>
                    <Badge tone="primary" className="mt-1.5">
                      {bySpecialty[d.specialtyId]?.name ?? d.specialtyId}
                    </Badge>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-muted px-2 py-2">
                    <dt className="text-fg-subtle">Experience</dt>
                    <dd className="font-bold text-fg">{d.experienceYears} yrs</dd>
                  </div>
                  <div className="rounded-lg bg-muted px-2 py-2">
                    <dt className="text-fg-subtle">Rating</dt>
                    <dd className="flex items-center justify-center gap-0.5 font-bold text-fg">
                      <Icon name="star" className="size-3 text-amber-400" fill="currentColor" strokeWidth={0} />
                      {d.rating.toFixed(1)}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-muted px-2 py-2">
                    <dt className="text-fg-subtle">Consults</dt>
                    <dd className="font-bold text-fg">{formatCompact(d.consultations)}+</dd>
                  </div>
                </dl>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-fg-muted">
                  <Icon name="languages" className="size-3.5" /> {d.languages.join(", ")}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-success">
                  <Icon name="clock" className="size-3.5" /> Next available: {d.nextSlot}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <p>
                    <span className="text-lg font-extrabold text-fg">{formatPrice(d.fee)}</span>
                    <span className="text-xs text-fg-subtle"> / consultation</span>
                  </p>
                  <Button size="sm" onClick={() => setBooking(d)}>
                    <Icon name="video" className="size-4" /> Book
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon="stethoscope" title="No doctors found" text="Try another specialty or search term." />
        )}
      </section>

      <ConsultationModal doctor={booking} specialty={booking ? bySpecialty[booking.specialtyId]?.name : undefined} onClose={() => setBooking(null)} />
    </>
  );
}

function ConsultationModal({ doctor, specialty, onClose }: { doctor: Doctor | null; specialty?: string; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ name: "", phone: "", age: "", symptoms: "", slot: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);

  // Reset and prefill whenever a different doctor is chosen.
  const [openedFor, setOpenedFor] = useState<Doctor | null>(null);
  if (doctor !== openedFor) {
    setOpenedFor(doctor);
    if (doctor) {
      setForm((f) => ({ ...f, name: f.name || user?.name || "", phone: f.phone || user?.phone || "", slot: doctor.slots[0] ?? "" }));
      setErrors({});
      setDone(null);
    }
  }

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Please enter the patient's name.";
    if (!isValidBdPhone(form.phone)) errs.phone = "Enter a valid mobile number, e.g. 01XXXXXXXXX.";
    const age = Number(form.age);
    if (!form.age || !Number.isFinite(age) || age < 0 || age > 120) errs.age = "Enter an age between 0 and 120.";
    if (form.symptoms.trim().length < 5) errs.symptoms = "Briefly describe the reason for the consultation.";
    if (!form.slot) errs.slot = "Choose a time slot.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const rec = saveRecord(recordKeys.consultations, { ...form, age, doctorId: doctor.id, doctorName: doctor.name, fee: doctor.fee });
    toast({ tone: "success", title: "Consultation requested", description: `${doctor.name} · ${form.slot}` });
    setDone(rec.id);
  };

  return (
    <Modal open={doctor !== null} onClose={onClose} title={done ? "Consultation requested" : "Book a video consultation"}>
      {doctor ? (
        done ? (
          <div className="py-2 text-center">
            <span className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-success/12 text-success">
              <Icon name="circle-check" className="size-7" />
            </span>
            <p className="font-bold text-fg">Request {done}</p>
            <p className="mt-1 text-sm text-fg-muted">
              {doctor.name} · {form.slot}. You&apos;d receive a video link by SMS before the appointment.
            </p>
            <p className="mt-3 rounded-lg bg-warning/12 p-2 text-xs text-fg">Demo storefront: no real consultation has been booked and no doctor will call.</p>
            <Button className="mt-5" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 font-bold text-white" aria-hidden>
                {doctor.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-fg">{doctor.name}</p>
                <p className="truncate text-xs text-fg-muted">{specialty}</p>
              </div>
              <p className="shrink-0 font-extrabold text-fg">{formatPrice(doctor.fee)}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
              <Field label="Patient name" htmlFor="dc-name" error={errors.name} required>
                <Input id="dc-name" value={form.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} autoComplete="name" data-autofocus />
              </Field>
              <Field label="Age" htmlFor="dc-age" error={errors.age} required>
                <Input id="dc-age" value={form.age} onChange={set("age")} aria-invalid={Boolean(errors.age)} inputMode="numeric" />
              </Field>
            </div>
            <Field label="Mobile number" htmlFor="dc-phone" error={errors.phone} required>
              <Input id="dc-phone" value={form.phone} onChange={set("phone")} aria-invalid={Boolean(errors.phone)} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
            </Field>
            <Field label="Symptoms / reason" htmlFor="dc-symptoms" error={errors.symptoms} required>
              <Textarea id="dc-symptoms" value={form.symptoms} onChange={set("symptoms")} aria-invalid={Boolean(errors.symptoms)} maxLength={600} placeholder="e.g. fever for 3 days with body ache" />
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-fg">
                Time slot <span className="text-danger">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {doctor.slots.map((s) => (
                  <label key={s} className={cn("flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-xs font-semibold transition", form.slot === s ? "border-primary-500 bg-primary/10 text-primary-700 dark:text-primary-300" : "border-line hover:border-primary-300")}>
                    <input type="radio" name="slot" value={s} checked={form.slot === s} onChange={set("slot")} className="sr-only" />
                    {s}
                  </label>
                ))}
              </div>
              {errors.slot ? <p className="mt-1 text-xs text-danger">{errors.slot}</p> : null}
            </fieldset>
            <p className="flex items-start gap-2 rounded-lg bg-danger/8 p-2.5 text-xs text-fg">
              <Icon name="warning" className="mt-0.5 size-4 shrink-0 text-danger" />
              Not for emergencies. For chest pain, severe breathing difficulty, heavy bleeding or loss of consciousness, go to the nearest hospital.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Request consultation</Button>
            </div>
          </form>
        )
      ) : null}
    </Modal>
  );
}
