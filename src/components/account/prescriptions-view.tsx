"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import { useT } from "@/lib/use-t";
import { toast, usePrescriptionStore } from "@/stores";
import type { Prescription } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";
import { PrescriptionUploadButton } from "@/components/checkout/prescription-picker";
import { AccountHeading } from "./account-shell";

const statusTone = { pending: "warning", reviewed: "success", rejected: "danger" } as const;
const statusText = { pending: "Awaiting review", reviewed: "Verified", rejected: "Rejected" } as const;

export function PrescriptionsView() {
  const t = useT();
  const items = usePrescriptionStore((s) => s.items);
  const remove = usePrescriptionStore((s) => s.remove);
  const [preview, setPreview] = useState<Prescription | null>(null);
  const [deleting, setDeleting] = useState<Prescription | null>(null);

  return (
    <div>
      <AccountHeading title={t("account.prescriptions")} subtitle="Upload once and reuse your prescriptions for future orders." action={<PrescriptionUploadButton variant="primary" />} />

      <div className="card mb-4 flex items-start gap-3 bg-rx/5 p-4 text-sm">
        <Icon name="shield-check" className="mt-0.5 size-5 shrink-0 text-rx" />
        <p className="text-fg-muted">
          Make sure the doctor&apos;s name, registration number, date and the medicines are clearly visible. Files stay on this device in the demo; a real deployment sends them securely to the pharmacist team.
        </p>
      </div>

      {items.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <li key={p.id} className="card overflow-hidden">
              <button type="button" onClick={() => setPreview(p)} className="block w-full" aria-label={`Preview ${p.fileName}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.dataUrl} alt={p.fileName} className="aspect-[3/4] w-full bg-muted object-cover transition hover:opacity-90" />
              </button>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={statusTone[p.status]}>{statusText[p.status]}</Badge>
                  <button type="button" onClick={() => setDeleting(p)} className="grid size-7 place-items-center rounded-full text-fg-subtle hover:bg-danger/10 hover:text-danger" aria-label={`Delete ${p.fileName}`}>
                    <Icon name="trash" className="size-4" />
                  </button>
                </div>
                <p className="mt-2 truncate text-xs font-medium text-fg" title={p.fileName}>
                  {p.fileName}
                </p>
                <p className="text-[0.6875rem] text-fg-subtle">{formatDate(p.createdAt, true)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card">
          <EmptyState icon="file-text" title={t("account.noPrescriptions")} text="Upload a photo of your prescription to order prescription-only medicines." action={<PrescriptionUploadButton variant="primary" />} />
        </div>
      )}

      <Modal open={preview !== null} onClose={() => setPreview(null)} title={preview?.fileName ?? ""} className="max-w-2xl">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.dataUrl} alt={preview.fileName} className="max-h-[70vh] w-full rounded-lg object-contain" />
        ) : null}
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete prescription?"
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
                toast({ title: "Prescription deleted" });
              }}
            >
              {t("common.delete")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">Orders that already used this prescription keep their reference, but you won&apos;t be able to attach it again.</p>
      </Modal>
    </div>
  );
}
