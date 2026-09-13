"use client";

import { useState } from "react";
import { zoneForDistrict } from "@/lib/cart";
import { useT } from "@/lib/use-t";
import { toast, useAddressStore, useAuthStore } from "@/stores";
import type { Address } from "@/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Checkbox } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";
import { AddressForm, emptyAddress, validateAddress, type AddressDraft, type AddressErrors } from "@/components/checkout/address-form";
import { AccountHeading } from "./account-shell";

export function AddressBook() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const items = useAddressStore((s) => s.items);
  const save = useAddressStore((s) => s.save);
  const remove = useAddressStore((s) => s.remove);
  const setDefault = useAddressStore((s) => s.setDefault);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress());
  const [makeDefault, setMakeDefault] = useState(false);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [deleting, setDeleting] = useState<Address | null>(null);

  const openNew = () => {
    setDraft({ ...emptyAddress(), name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "" });
    setMakeDefault(items.length === 0);
    setErrors({});
    setEditing("new");
  };
  const openEdit = (a: Address) => {
    setDraft({ label: a.label, name: a.name, phone: a.phone, email: a.email ?? "", street: a.street, area: a.area, district: a.district });
    setMakeDefault(a.isDefault);
    setErrors({});
    setEditing(a);
  };
  const submit = () => {
    const e = validateAddress(draft, { required: t("checkout.requiredField"), phone: t("checkout.invalidPhone") });
    setErrors(e);
    if (Object.keys(e).length) return;
    save({ ...draft, email: draft.email || undefined, id: editing && editing !== "new" ? editing.id : undefined, isDefault: makeDefault });
    toast({ tone: "success", title: editing === "new" ? "Address added" : "Address updated" });
    setEditing(null);
  };

  return (
    <div>
      <AccountHeading
        title={t("account.addresses")}
        subtitle="Saved addresses make checkout faster."
        action={
          <Button size="sm" onClick={openNew}>
            <Icon name="plus" className="size-4" /> {t("checkout.newAddress")}
          </Button>
        }
      />
      {items.length ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((a) => {
            const zone = zoneForDistrict(a.district);
            return (
              <li key={a.id} className="card flex flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-bold text-fg">
                    <Icon name="map-pin" className="size-4 text-primary-600" />
                    {a.label}
                    {a.isDefault ? <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase text-primary-700 dark:text-primary-300">Default</span> : null}
                  </p>
                  <span className="text-xs text-fg-subtle">{zone.label}</span>
                </div>
                <p className="mt-2 text-sm text-fg">
                  {a.name} · {a.phone}
                </p>
                <p className="text-sm text-fg-muted">{[a.street, a.area, a.district].filter(Boolean).join(", ")}</p>
                {a.email ? <p className="text-xs text-fg-subtle">{a.email}</p> : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button size="xs" variant="outline" onClick={() => openEdit(a)}>
                    {t("common.edit")}
                  </Button>
                  {!a.isDefault ? (
                    <Button size="xs" variant="ghost" onClick={() => setDefault(a.id)}>
                      Set as default
                    </Button>
                  ) : null}
                  <Button size="xs" variant="ghost" className="ml-auto text-danger" onClick={() => setDeleting(a)}>
                    <Icon name="trash" className="size-3.5" /> {t("common.delete")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card">
          <EmptyState icon="map-pin" title={t("account.noAddresses")} text="Add your home or office address to check out in one tap." action={<Button onClick={openNew}>{t("checkout.newAddress")}</Button>} />
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? t("checkout.newAddress") : "Edit address"}
        className="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={submit}>{t("common.save")}</Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <AddressForm value={draft} onChange={setDraft} errors={errors} idPrefix="ab" />
          <Checkbox label="Use as my default address" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="mt-4" />
          <button type="submit" className="sr-only">
            {t("common.save")}
          </button>
        </form>
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete this address?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleting) remove(deleting.id);
                setDeleting(null);
                toast({ title: "Address deleted" });
              }}
            >
              {t("common.delete")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          {deleting ? `${deleting.label}: ${[deleting.street, deleting.area, deleting.district].filter(Boolean).join(", ")}` : ""}
        </p>
      </Modal>
    </div>
  );
}
