"use client";

import { useState } from "react";
import { deliveryConfig } from "@/config/commerce.config";
import { routes } from "@/lib/routes";
import { isValidBdPhone, isValidEmail } from "@/lib/utils";
import { toast } from "@/stores";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { recordKeys, saveRecord } from "./local-records";

const empty = { pharmacyName: "", ownerName: "", phone: "", email: "", district: "", address: "", tradeLicense: "", drugLicense: "", agree: false };
type FormState = typeof empty;

/** Partner pharmacy application form (saved locally in the demo; POST to an API in production). */
export function PharmacyRegistrationForm() {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [done, setDone] = useState<string | null>(null);

  const set = (k: keyof FormState) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = (f: FormState) => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (f.pharmacyName.trim().length < 3) errs.pharmacyName = "Enter the registered pharmacy name.";
    if (f.ownerName.trim().length < 3) errs.ownerName = "Enter the owner's full name.";
    if (!isValidBdPhone(f.phone)) errs.phone = "Enter a valid mobile number, e.g. 01XXXXXXXXX.";
    if (f.email.trim() && !isValidEmail(f.email.trim())) errs.email = "Enter a valid email address.";
    if (!f.district) errs.district = "Select a district.";
    if (f.address.trim().length < 10) errs.address = "Enter the full shop address.";
    if (f.tradeLicense.trim().length < 4) errs.tradeLicense = "Enter the trade license number.";
    if (f.drugLicense.trim().length < 4) errs.drugLicense = "Enter the drug license number.";
    if (!f.agree) errs.agree = "Please confirm the details are correct.";
    return errs;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`ph-${first}`)?.focus();
      return;
    }
    const rec = saveRecord(recordKeys.pharmacyApplications, { ...form, agree: undefined });
    toast({ tone: "success", title: "Application submitted", description: `Reference ${rec.id}` });
    setDone(rec.id);
  };

  if (done) {
    return (
      <div className="card flex flex-col items-center p-8 text-center">
        <span className="mb-4 grid size-16 place-items-center rounded-full bg-success/12 text-success">
          <Icon name="circle-check" className="size-8" />
        </span>
        <h2 className="text-xl font-bold text-fg">Application received</h2>
        <p className="mt-1 max-w-md text-sm text-fg-muted">
          Thanks, {form.ownerName.split(" ")[0]}. Your reference is <span className="font-bold text-fg">{done}</span>. Our partnerships team will verify your licenses and call {form.phone} within 2 working days.
        </p>
        <p className="mt-3 rounded-lg bg-muted p-2 text-xs text-fg-subtle">Demo storefront: the application is saved on this device only.</p>
        <div className="mt-6 flex gap-2">
          <ButtonLink href={routes.home()}>Back to home</ButtonLink>
          <Button
            variant="outline"
            onClick={() => {
              setForm(empty);
              setDone(null);
            }}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  const err = (k: keyof FormState) => errors[k];
  return (
    <form onSubmit={submit} className="card space-y-5 p-5 md:p-7" noValidate>
      <div>
        <h2 className="text-lg font-bold text-fg">Pharmacy details</h2>
        <p className="text-sm text-fg-muted">All fields marked * are required.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Pharmacy name" htmlFor="ph-pharmacyName" error={err("pharmacyName")} required>
          <Input id="ph-pharmacyName" value={form.pharmacyName} onChange={set("pharmacyName")} aria-invalid={Boolean(err("pharmacyName"))} autoComplete="organization" />
        </Field>
        <Field label="Owner name" htmlFor="ph-ownerName" error={err("ownerName")} required>
          <Input id="ph-ownerName" value={form.ownerName} onChange={set("ownerName")} aria-invalid={Boolean(err("ownerName"))} autoComplete="name" />
        </Field>
        <Field label="Mobile number" htmlFor="ph-phone" error={err("phone")} required>
          <Input id="ph-phone" value={form.phone} onChange={set("phone")} aria-invalid={Boolean(err("phone"))} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
        </Field>
        <Field label="Email" htmlFor="ph-email" error={err("email")} hint="Optional">
          <Input id="ph-email" type="email" value={form.email} onChange={set("email")} aria-invalid={Boolean(err("email"))} autoComplete="email" />
        </Field>
        <Field label="District" htmlFor="ph-district" error={err("district")} required>
          <Select id="ph-district" value={form.district} onChange={set("district")} aria-invalid={Boolean(err("district"))}>
            <option value="">Select district</option>
            {[...deliveryConfig.districts].sort().map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Trade license no." htmlFor="ph-tradeLicense" error={err("tradeLicense")} required>
          <Input id="ph-tradeLicense" value={form.tradeLicense} onChange={set("tradeLicense")} aria-invalid={Boolean(err("tradeLicense"))} />
        </Field>
        <Field label="Drug license no." htmlFor="ph-drugLicense" error={err("drugLicense")} required>
          <Input id="ph-drugLicense" value={form.drugLicense} onChange={set("drugLicense")} aria-invalid={Boolean(err("drugLicense"))} />
        </Field>
      </div>
      <Field label="Full shop address" htmlFor="ph-address" error={err("address")} required>
        <Textarea id="ph-address" value={form.address} onChange={set("address")} aria-invalid={Boolean(err("address"))} className="min-h-20" placeholder="Shop no., building, road, area" />
      </Field>
      <div>
        <Checkbox
          id="ph-agree"
          label="I confirm that the information is correct and that the pharmacy holds valid licenses."
          checked={form.agree}
          onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))}
          aria-invalid={Boolean(err("agree"))}
        />
        {err("agree") ? <p className="mt-1 text-xs text-danger">{err("agree")}</p> : null}
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Submit application
        </Button>
      </div>
    </form>
  );
}
