"use client";

import { useRef, useState } from "react";
import { cartConfig } from "@/config/commerce.config";
import { formatDate } from "@/lib/format";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { toast, usePrescriptionStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { downscaleImage, isQuotaError, prescriptionAccept } from "./prescription-utils";

/** Upload button that downscales images and stores them as prescriptions. Returns the new ids. */
export function PrescriptionUploadButton({
  onUploaded,
  label,
  variant = "outline",
  className,
  max = cartConfig.prescriptionMaxFiles,
}: {
  onUploaded?: (ids: string[]) => void;
  label?: string;
  variant?: "outline" | "primary" | "secondary";
  className?: string;
  max?: number;
}) {
  const t = useT();
  const add = usePrescriptionStore((s) => s.add);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const ids: string[] = [];
    for (const file of [...files].slice(0, max)) {
      try {
        const dataUrl = await downscaleImage(file);
        ids.push(add({ fileName: file.name, dataUrl }).id);
      } catch (err) {
        toast({ tone: "error", title: isQuotaError(err) ? "Storage is full on this device. Delete old prescriptions and try again." : err instanceof Error ? err.message : "Upload failed" });
      }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
    if (ids.length) {
      toast({ tone: "success", title: t("checkout.prescriptionUploaded"), description: `${ids.length} file${ids.length > 1 ? "s" : ""} added` });
      onUploaded?.(ids);
    }
  };

  return (
    <>
      <input ref={input} type="file" accept={prescriptionAccept} multiple className="sr-only" onChange={(e) => void onFiles(e.target.files)} tabIndex={-1} aria-hidden />
      <Button variant={variant} loading={busy} onClick={() => input.current?.click()} className={className}>
        <Icon name="upload" className="size-4" />
        {label ?? t("checkout.uploadPrescription")}
      </Button>
    </>
  );
}

/** Choose existing prescriptions (or upload new ones) for an order. */
export function PrescriptionPicker({ selected, onChange, error }: { selected: string[]; onChange: (ids: string[]) => void; error?: string | null }) {
  const items = usePrescriptionStore((s) => s.items);
  const max = cartConfig.prescriptionMaxFiles;
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else if (selected.length < max) onChange([...selected, id]);
    else toast({ tone: "error", title: `You can attach up to ${max} prescriptions` });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <PrescriptionUploadButton onUploaded={(ids) => onChange([...selected, ...ids].slice(0, max))} />
        <p className="text-xs text-fg-subtle">JPG, PNG or WebP · up to {max} files · clear photo of the whole page</p>
      </div>
      {items.length ? (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((p) => {
            const on = selected.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  aria-pressed={on}
                  className={cn("group relative block w-full overflow-hidden rounded-xl border-2 text-left transition", on ? "border-primary-500" : "border-line hover:border-primary-300")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.dataUrl} alt={p.fileName} className="aspect-[3/4] w-full bg-muted object-cover" />
                  <span className={cn("absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full border-2 border-white shadow", on ? "bg-primary text-primary-fg" : "bg-white/80 text-transparent")}>
                    <Icon name="check" className="size-3.5" />
                  </span>
                  <span className="block truncate px-2 py-1 text-[0.6875rem] text-fg-muted">{formatDate(p.createdAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
