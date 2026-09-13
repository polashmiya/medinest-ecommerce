import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "rx" | "discount" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-fg-muted",
  primary: "bg-primary/10 text-primary-700 dark:text-primary-300",
  accent: "bg-accent-500/15 text-accent-700 dark:text-accent-300",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-[color-mix(in_oklab,var(--warning)_70%,black)] dark:text-warning",
  danger: "bg-danger/12 text-danger",
  rx: "bg-rx/12 text-rx",
  discount: "bg-discount text-white",
  info: "bg-info/12 text-info",
};

export function Badge({ tone = "neutral", className, children, title }: { tone?: Tone; className?: string; children: ReactNode; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase leading-none tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
