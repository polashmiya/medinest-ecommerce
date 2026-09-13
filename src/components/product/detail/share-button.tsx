"use client";

import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { toast } from "@/stores";
import { Icon } from "@/components/ui/icon";

/** Native share sheet where available, otherwise copies the page URL. */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const t = useT();
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ tone: "success", title: t("common.copied"), description: url });
    } catch {
      toast({ tone: "error", title: t("common.somethingWrong") });
    }
  };
  return (
    <button type="button" onClick={share} className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold text-fg-muted hover:bg-muted hover:text-fg", className)}>
      <Icon name="share" className="size-4" />
      {t("product.shareProduct")}
    </button>
  );
}
