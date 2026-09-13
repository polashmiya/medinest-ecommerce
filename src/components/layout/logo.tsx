import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

/** Text mark with a small original emblem (a leaf-cross in a rounded square). */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  if (siteConfig.logo.image) {
    return (
      <Link href="/" className={cn("inline-flex items-center", className)} aria-label={`${siteConfig.name} home`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={siteConfig.logo.image} alt={siteConfig.name} className="h-8 w-auto" />
      </Link>
    );
  }
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 text-fg", className)} aria-label={`${siteConfig.name} home`}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <rect width="40" height="40" rx="12" className="fill-primary" />
        <path d="M20 9c5 4 7 8 7 11.5A7 7 0 0 1 20 28a7 7 0 0 1-7-7.5C13 17 15 13 20 9Z" fill="#fff" opacity=".95" />
        <path d="M20 15v10M15 20h10" className="stroke-primary" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="31" cy="31" r="4" className="fill-accent-400" />
      </svg>
      {compact ? null : (
        <span className="text-xl font-extrabold tracking-tight">
          {siteConfig.name.replace(/Nest$/, "")}
          <span className="text-primary-600 dark:text-primary-400">{siteConfig.name.match(/Nest$/) ? "Nest" : ""}</span>
        </span>
      )}
    </Link>
  );
}
