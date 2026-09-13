"use client";

import { useState } from "react";
import { toast } from "@/stores";
import { Icon } from "@/components/ui/icon";

/** Native share sheet where supported, with copy-link and WhatsApp fallbacks. */
export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const btn = "inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-semibold text-fg-muted hover:border-primary-300 hover:text-fg";

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    await copy();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ tone: "success", title: "Link copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ tone: "error", title: "Couldn't copy the link" });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className={btn}>
        <Icon name="share" className="size-3.5" /> Share
      </button>
      <button type="button" onClick={copy} className={btn}>
        <Icon name={copied ? "check" : "copy"} className="size-3.5" /> {copied ? "Copied" : "Copy link"}
      </button>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className={btn}>
        <Icon name="message-circle" className="size-3.5" /> WhatsApp
      </a>
    </div>
  );
}
