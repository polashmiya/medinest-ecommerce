import Link from "next/link";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Brand } from "@/types";

const TINTS = ["bg-primary/10 text-primary-700", "bg-accent-500/12 text-accent-700", "bg-rx/10 text-rx", "bg-info/10 text-info", "bg-discount/10 text-discount", "bg-success/10 text-success"];

/** Initials monogram for a brand (logos are not part of the mock catalog). */
export function brandInitials(name: string) {
  const words = name.replace(/\b(ltd|limited|plc|pvt|inc|co|company|pharmaceuticals?|pharma|industries|laboratories|labs?)\b\.?/gi, "").trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? name).slice(0, 2)).toUpperCase();
}

export function BrandMonogram({ brand, className }: { brand: Pick<Brand, "id" | "name">; className?: string }) {
  return (
    <span className={cn("grid place-items-center rounded-2xl font-extrabold tracking-tight", TINTS[brand.id % TINTS.length], className)} aria-hidden>
      {brandInitials(brand.name)}
    </span>
  );
}

export function BrandTile({ brand }: { brand: Brand }) {
  return (
    <Link href={routes.brand(brand.slug)} className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-center transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card">
      <BrandMonogram brand={brand} className="size-14 text-lg" />
      <span className="line-clamp-2 min-h-10 text-sm font-semibold leading-tight text-fg group-hover:text-primary-700">{brand.name}</span>
      <span className="text-xs text-fg-subtle">{brand.productCount} products</span>
    </Link>
  );
}
