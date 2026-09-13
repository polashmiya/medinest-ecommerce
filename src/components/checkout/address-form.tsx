"use client";

import { deliveryConfig } from "@/config/commerce.config";
import { labelValue } from "@/lib/i18n";
import { useT } from "@/lib/use-t";
import { cn, isValidBdPhone, isValidEmail } from "@/lib/utils";
import type { Address } from "@/types";
import { Field, Input, Select } from "@/components/ui/form";

export type AddressDraft = Omit<Address, "id" | "isDefault">;
export type AddressErrors = Partial<Record<keyof AddressDraft, string>>;

export const emptyAddress = (district = "Dhaka"): AddressDraft => ({
  label: labelValue<string[]>("checkout.labels")[0] ?? "Home",
  name: "",
  phone: "",
  email: "",
  street: "",
  area: "",
  district,
});

export function validateAddress(a: AddressDraft, messages: { required: string; phone: string }): AddressErrors {
  const errors: AddressErrors = {};
  if (!a.name.trim()) errors.name = messages.required;
  if (!a.phone.trim()) errors.phone = messages.required;
  else if (!isValidBdPhone(a.phone)) errors.phone = messages.phone;
  if (a.email && !isValidEmail(a.email)) errors.email = "Enter a valid email address";
  if (!a.street.trim()) errors.street = messages.required;
  if (!a.area.trim()) errors.area = messages.required;
  if (!a.district.trim()) errors.district = messages.required;
  return errors;
}

/** Controlled address fields shared by checkout and the address book. */
export function AddressForm({
  value,
  onChange,
  errors = {},
  idPrefix = "addr",
}: {
  value: AddressDraft;
  onChange: (next: AddressDraft) => void;
  errors?: AddressErrors;
  idPrefix?: string;
}) {
  const t = useT();
  const labels = labelValue<string[]>("checkout.labels");
  const set = <K extends keyof AddressDraft>(key: K) => (e: { target: { value: string } }) => onChange({ ...value, [key]: e.target.value });
  const id = (k: string) => `${idPrefix}-${k}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="mb-1.5 text-sm font-semibold text-fg">{t("checkout.addressLabel")}</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("checkout.addressLabel")}>
          {labels.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={value.label === l}
              onClick={() => onChange({ ...value, label: l })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                value.label === l ? "border-primary-500 bg-primary/10 text-primary-700 dark:text-primary-300" : "border-line text-fg-muted hover:border-primary-300",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <Field label={t("checkout.name")} htmlFor={id("name")} error={errors.name} required>
        <Input id={id("name")} value={value.name} onChange={set("name")} autoComplete="name" aria-invalid={Boolean(errors.name)} />
      </Field>
      <Field label={t("checkout.phone")} htmlFor={id("phone")} error={errors.phone} required>
        <Input id={id("phone")} value={value.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" aria-invalid={Boolean(errors.phone)} />
      </Field>
      <Field label={t("checkout.email")} htmlFor={id("email")} error={errors.email} hint={t("common.optional")} className="sm:col-span-2">
        <Input id={id("email")} type="email" value={value.email ?? ""} onChange={set("email")} autoComplete="email" aria-invalid={Boolean(errors.email)} />
      </Field>
      <Field label={t("checkout.address")} htmlFor={id("street")} error={errors.street} required className="sm:col-span-2">
        <Input id={id("street")} value={value.street} onChange={set("street")} autoComplete="street-address" placeholder="House, road, block" aria-invalid={Boolean(errors.street)} />
      </Field>
      <Field label={t("checkout.area")} htmlFor={id("area")} error={errors.area} required>
        <Input id={id("area")} value={value.area} onChange={set("area")} autoComplete="address-level3" aria-invalid={Boolean(errors.area)} />
      </Field>
      <Field label={t("checkout.district")} htmlFor={id("district")} error={errors.district} required>
        <Select id={id("district")} value={value.district} onChange={set("district")} aria-invalid={Boolean(errors.district)}>
          {deliveryConfig.districts.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
