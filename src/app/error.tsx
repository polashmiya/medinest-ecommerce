"use client";

import Link from "next/link";
import { useEffect } from "react";
import { siteConfig } from "@/config/site.config";
import { useT } from "@/lib/use-t";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/**
 * Route-level error boundary. `retry` re-fetches and re-renders the segment
 * (Next.js 16); `reset` is kept as a fallback for older runtimes.
 */
export default function Error({ error, retry, reset }: { error: Error & { digest?: string }; retry?: () => void; reset?: () => void }) {
  const t = useT();

  useEffect(() => {
    // Hook for an error-reporting service.
    console.error(error);
  }, [error]);

  return (
    <div className="container-app grid min-h-[60vh] place-items-center py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-danger/10 text-danger">
          <Icon name="warning" className="size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-fg">{t("errors.errorTitle")}</h1>
        <p className="mt-2 text-sm text-fg-muted">{t("errors.errorText")}</p>
        {error.digest ? <p className="mt-2 font-mono text-xs text-fg-subtle">Ref: {error.digest}</p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => (retry ?? reset)?.()}>
            <Icon name="refresh" className="size-4" /> {t("common.tryAgain")}
          </Button>
          <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-lg border border-line px-5 text-sm font-semibold text-fg hover:bg-muted">
            {t("errors.goHome")}
          </Link>
        </div>
        <p className="mt-6 text-xs text-fg-subtle">
          Still stuck? Call {siteConfig.contact.hotline} ({siteConfig.contact.supportHours}).
        </p>
      </div>
    </div>
  );
}
