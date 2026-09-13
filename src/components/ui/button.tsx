import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "link";
type Size = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors duration-150 select-none " +
  "disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-primary-700 active:bg-primary-800 shadow-sm",
  accent: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm",
  secondary: "bg-primary/10 text-primary-700 hover:bg-primary/15 dark:text-primary-300",
  outline: "border border-line bg-surface text-fg hover:bg-muted hover:border-primary-300",
  ghost: "text-fg-muted hover:bg-muted hover:text-fg",
  danger: "bg-danger text-white hover:opacity-90",
  link: "text-primary-600 hover:underline underline-offset-4 px-0 dark:text-primary-300",
};

const sizes: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs rounded-md",
  sm: "h-9 px-3.5 text-sm rounded-md",
  md: "h-11 px-5 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-lg",
  icon: "size-10 rounded-full",
  "icon-sm": "size-8 rounded-full",
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], variant === "link" && "h-auto", className);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  loading,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} disabled={loading || props.disabled} aria-busy={loading || undefined} {...props}>
      {loading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
