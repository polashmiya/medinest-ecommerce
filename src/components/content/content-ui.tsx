import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { BlogPost, ContentBlock, CoverArt } from "@/services/content/types";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

/**
 * Original cover illustration drawn from a gradient and an icon (no image
 * files). Decorative circles and a dotted grid give each cover some depth.
 */
export function CoverArtwork({ cover, className, iconClassName, children }: { cover: CoverArt; className?: string; iconClassName?: string; children?: ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden text-white", className)} style={{ background: `linear-gradient(135deg, ${cover.from}, ${cover.to})` }}>
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.3px, transparent 1.5px)", backgroundSize: "18px 18px" }} aria-hidden />
      <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/15" aria-hidden />
      <div className="absolute -bottom-12 -left-8 size-36 rounded-full bg-white/10" aria-hidden />
      <div className="absolute bottom-4 right-4 grid size-20 place-items-center rounded-3xl bg-white/15 backdrop-blur-sm md:size-24" aria-hidden>
        <Icon name={cover.icon} className={cn("size-10 md:size-12", iconClassName)} strokeWidth={1.6} />
      </div>
      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
}

/** Renders CMS-style content blocks as prose. */
export function ContentBlocks({ blocks, className }: { blocks: ContentBlock[]; className?: string }) {
  return (
    <div className={cn("prose-app", className)}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "note":
            return (
              <p key={i} className="my-6 flex gap-3 rounded-xl border border-info/25 bg-info/8 p-4 text-sm text-fg">
                <Icon name="info" className="mt-0.5 size-5 shrink-0 text-info" />
                <span>{b.text}</span>
              </p>
            );
          default:
            return <p key={i}>{b.text}</p>;
        }
      })}
    </div>
  );
}

export function PostMeta({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted", className)}>
      <span className="flex items-center gap-1">
        <Icon name="user" className="size-3.5" /> {post.author}
      </span>
      <span className="flex items-center gap-1">
        <Icon name="calendar" className="size-3.5" />
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </span>
      <span className="flex items-center gap-1">
        <Icon name="clock" className="size-3.5" /> {post.readMinutes} min read
      </span>
    </p>
  );
}

export function PostCard({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <article className={cn("card group flex flex-col overflow-hidden transition hover:shadow-card", className)}>
      <Link href={routes.blogPost(post.slug)} tabIndex={-1} aria-hidden>
        <CoverArtwork cover={post.cover} className="aspect-[16/9]" iconClassName="transition-transform duration-300 group-hover:scale-110" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Badge tone="primary" className="self-start">
          {post.category}
        </Badge>
        <h3 className="text-base font-bold leading-snug text-fg">
          <Link href={routes.blogPost(post.slug)} className="hover:text-primary-600 dark:hover:text-primary-300">
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm text-fg-muted">{post.excerpt}</p>
        <PostMeta post={post} className="mt-auto pt-2" />
      </div>
    </article>
  );
}

/** Numbered "how it works" steps used on service pages. */
export function Steps({ steps, className }: { steps: { title: string; text: string; icon: string }[]; className?: string }) {
  return (
    <ol className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {steps.map((s, i) => (
        <li key={s.title} className="card relative p-5">
          <span className="absolute right-4 top-4 text-3xl font-extrabold text-primary/15">{i + 1}</span>
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary-600 dark:text-primary-300">
            <Icon name={s.icon} className="size-5" />
          </span>
          <p className="font-bold text-fg">{s.title}</p>
          <p className="mt-1 text-sm text-fg-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Gradient hero used by the service pages (lab tests, doctors, prescriptions…). */
export function ServiceHero({
  eyebrow,
  title,
  text,
  cover,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  text: string;
  cover: CoverArt;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <CoverArtwork cover={cover} className="rounded-3xl" iconClassName="size-12">
      <div className="grid gap-6 p-6 pb-28 md:px-10 md:pt-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:pb-10">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-white/85 md:text-base">{text}</p>
          {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
        </div>
        {aside ? <div className="hidden lg:block">{aside}</div> : null}
      </div>
    </CoverArtwork>
  );
}
