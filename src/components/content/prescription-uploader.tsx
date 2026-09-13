"use client";

import { useRef, useState } from "react";
import { cartConfig } from "@/config/commerce.config";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { toast, useAuthStore, useHydrated, useNotificationStore, usePrescriptionStore } from "@/stores";
import { Button, ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/display";
import { Field, Textarea } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { dataUrlBytes, downscaleImage, formatBytes } from "./image-utils";

interface Pending {
  id: string;
  name: string;
  dataUrl: string;
  bytes: number;
}

const MAX_FILES = cartConfig.prescriptionMaxFiles;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/**
 * Prescription uploader: drag & drop, file picker and camera capture. Images
 * are downscaled on the device, then saved through the prescription store
 * (swap for an upload API in production).
 */
export function PrescriptionUploader() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const add = usePrescriptionStore((s) => s.add);
  const notify = useNotificationStore((s) => s.push);
  const [files, setFiles] = useState<Pending[]>([]);
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const picker = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);

  if (!hydrated) {
    return (
      <div className="card space-y-4 p-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-11 w-40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card flex flex-col items-center p-8 text-center">
        <span className="mb-4 grid size-14 place-items-center rounded-full bg-primary/10 text-primary-600">
          <Icon name="lock" className="size-6" />
        </span>
        <h2 className="text-lg font-bold text-fg">Log in to upload a prescription</h2>
        <p className="mt-1 max-w-sm text-sm text-fg-muted">Prescriptions are saved to your account so our pharmacists can link them to your orders.</p>
        <ButtonLink href={routes.login(routes.uploadPrescription())} className="mt-5">
          Log in or sign up
        </ButtonLink>
      </div>
    );
  }

  if (done !== null) {
    return (
      <div className="card flex flex-col items-center p-8 text-center">
        <span className="mb-4 grid size-16 place-items-center rounded-full bg-success/12 text-success">
          <Icon name="circle-check" className="size-8" />
        </span>
        <h2 className="text-xl font-bold text-fg">Prescription received</h2>
        <p className="mt-1 max-w-md text-sm text-fg-muted">
          {done} {done === 1 ? "file was" : "files were"} saved to your account. A pharmacist will review {done === 1 ? "it" : "them"} and prescription-only items can then be added to your order.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <ButtonLink href={routes.prescriptions()}>View my prescriptions</ButtonLink>
          <ButtonLink href={routes.categories()} variant="outline">
            Continue shopping
          </ButtonLink>
          <Button variant="ghost" onClick={() => setDone(null)}>
            Upload another
          </Button>
        </div>
      </div>
    );
  }

  const accept = async (list: FileList | File[]) => {
    setError(null);
    const incoming = [...list];
    const room = MAX_FILES - files.length;
    if (room <= 0) {
      setError(`You can upload up to ${MAX_FILES} files at a time.`);
      return;
    }
    const images = incoming.filter((f) => f.type.startsWith("image/"));
    if (images.length < incoming.length) setError("Only image files (JPG, PNG, HEIC…) are supported. Take a photo of a paper prescription.");
    const tooBig = images.filter((f) => f.size > MAX_INPUT_BYTES);
    if (tooBig.length) setError("Some files were larger than 15 MB and were skipped.");
    const usable = images.filter((f) => f.size <= MAX_INPUT_BYTES).slice(0, room);
    if (images.length > room) setError(`Only the first ${room} file(s) were added (maximum ${MAX_FILES}).`);
    if (!usable.length) return;
    setBusy(true);
    try {
      const processed = await Promise.all(
        usable.map(async (f) => {
          const { dataUrl } = await downscaleImage(f, cartConfig.prescriptionMaxPx, 0.75);
          return { id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`, name: f.name || "prescription.jpg", dataUrl, bytes: dataUrlBytes(dataUrl) };
        }),
      );
      setFiles((prev) => [...prev, ...processed]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not process that image.");
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!files.length) {
      setError("Add at least one photo of your prescription.");
      return;
    }
    try {
      for (const f of files) add({ fileName: f.name, dataUrl: f.dataUrl, note: note.trim() || undefined });
    } catch {
      setError("Your device storage is full. Remove older prescriptions and try again.");
      return;
    }
    notify({ title: "Prescription uploaded", body: `${files.length} file(s) received. A pharmacist will review shortly.`, href: routes.prescriptions() });
    toast({ tone: "success", title: "Prescription uploaded" });
    setDone(files.length);
    setFiles([]);
    setNote("");
  };

  return (
    <div className="card p-5 md:p-6">
      <h2 className="text-lg font-bold text-fg">Upload your prescription</h2>
      <p className="mt-1 text-sm text-fg-muted">Make sure the doctor&apos;s name, date, patient name and medicines are clearly visible.</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void accept(e.dataTransfer.files);
        }}
        className={cn(
          "mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
          dragging ? "border-primary-500 bg-primary/8" : "border-line bg-muted/50",
        )}
      >
        <span className="mb-3 grid size-14 place-items-center rounded-full bg-primary/10 text-primary-600">
          {busy ? <Icon name="loader" className="size-6 animate-spin" /> : <Icon name="upload" className="size-6" />}
        </span>
        <p className="font-semibold text-fg">Drag & drop photos here</p>
        <p className="mt-1 text-xs text-fg-subtle">
          Up to {MAX_FILES} images · compressed on your device before saving
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => picker.current?.click()} disabled={busy}>
            <Icon name="file-up" className="size-4" /> Choose files
          </Button>
          <Button variant="outline" size="sm" onClick={() => camera.current?.click()} disabled={busy}>
            <Icon name="camera" className="size-4" /> Take a photo
          </Button>
        </div>
        <input ref={picker} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) void accept(e.target.files); e.target.value = ""; }} />
        <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { if (e.target.files) void accept(e.target.files); e.target.value = ""; }} />
      </div>

      {error ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-danger" role="alert">
          <Icon name="warning" className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      ) : null}

      {files.length ? (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((f) => (
            <li key={f.id} className="group relative overflow-hidden rounded-xl border border-line bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.dataUrl} alt={f.name} className="aspect-[3/4] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white">
                <p className="truncate text-xs font-semibold">{f.name}</p>
                <p className="text-[0.6875rem] opacity-80">{formatBytes(f.bytes)}</p>
              </div>
              <button type="button" onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-surface/90 text-danger shadow" aria-label={`Remove ${f.name}`}>
                <Icon name="x" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Field label="Note for the pharmacist" htmlFor="rx-note" hint="Optional — e.g. which medicines you need or the quantity." className="mt-5">
        <Textarea id="rx-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Please send 2 strips of each medicine…" />
      </Field>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
          <Icon name="lock" className="size-3.5" /> Visible only to you and our pharmacists.
        </p>
        <Button size="lg" onClick={submit} disabled={busy || !files.length}>
          <Icon name="upload" className="size-5" /> Submit prescription
        </Button>
      </div>
    </div>
  );
}
