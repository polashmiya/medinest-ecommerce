"use client";

import { cartConfig } from "@/config/commerce.config";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export const prescriptionAccept = "image/*";

/**
 * Read an image file, downscale it so the long edge is at most
 * `cartConfig.prescriptionMaxPx`, and return a JPEG data URL. Keeps uploads
 * small enough for localStorage (mock storage) and fast to send to an API later.
 */
export async function downscaleImage(file: File, maxPx = cartConfig.prescriptionMaxPx, quality = 0.75): Promise<string> {
  if (!file.type.startsWith("image/") && !ACCEPTED.includes(file.type)) throw new Error("Please choose an image file (JPG, PNG or WebP).");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("This image could not be read. Try a JPG or PNG photo."));
      el.src = url;
    });
    const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processing is not supported in this browser.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Human readable reason when a data URL can't be persisted (quota exceeded). */
export function isQuotaError(err: unknown) {
  return err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22);
}
