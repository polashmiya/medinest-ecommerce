import Link from "next/link";
import { notFound } from "next/navigation";
import { features } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { content } from "@/services/content";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, EmptyState } from "@/components/ui/display";
import { ButtonLink } from "@/components/ui/button";
import { CoverArtwork, PostCard, PostMeta } from "@/components/content/content-ui";

export async function generateMetadata({ searchParams }: PageProps<"/blog">) {
  const { category } = await searchParams;
  const cat = typeof category === "string" ? category : undefined;
  return pageMetadata({
    title: cat ? `${cat} articles` : "Health blog",
    description: `Practical, pharmacist-reviewed articles on medicine safety, wellness, nutrition, skincare and family health from ${siteConfig.name}.`,
    path: cat ? `${routes.blog()}?category=${encodeURIComponent(cat)}` : routes.blog(),
  });
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  if (!features.blog) notFound();
  const { category } = await searchParams;
  const active = typeof category === "string" ? category : undefined;
  const all = await content.getBlogPosts();
  const categories = [...new Set(all.map((p) => p.category))];
  const posts = active ? all.filter((p) => p.category === active) : all;
  const [featured, ...rest] = active ? [undefined, ...posts] : posts;

  return (
    <div className="container-app py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} className="mb-4" />
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-fg md:text-3xl">{active ? active : "Health blog"}</h1>
          <p className="mt-1 text-sm text-fg-muted">Clear, practical health information from our pharmacists and editors.</p>
        </div>
      </div>

      <nav aria-label="Blog categories" className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1">
        {[undefined, ...categories].map((c) => (
          <Link
            key={c ?? "all"}
            href={c ? `${routes.blog()}?category=${encodeURIComponent(c)}` : routes.blog()}
            aria-current={c === active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition",
              c === active ? "border-primary bg-primary text-primary-fg" : "border-line bg-surface text-fg-muted hover:border-primary-300 hover:text-fg",
            )}
          >
            {c ?? "All articles"}
          </Link>
        ))}
      </nav>

      {featured ? (
        <article className="card mb-10 grid overflow-hidden md:grid-cols-2">
          <Link href={routes.blogPost(featured.slug)} tabIndex={-1} aria-hidden>
            <CoverArtwork cover={featured.cover} className="h-full min-h-56" iconClassName="size-14" />
          </Link>
          <div className="flex flex-col justify-center gap-3 p-6 md:p-10">
            <div className="flex gap-2">
              <Badge tone="accent">Featured</Badge>
              <Badge tone="primary">{featured.category}</Badge>
            </div>
            <h2 className="text-xl font-extrabold leading-tight text-fg md:text-2xl">
              <Link href={routes.blogPost(featured.slug)} className="hover:text-primary-600 dark:hover:text-primary-300">
                {featured.title}
              </Link>
            </h2>
            <p className="text-sm text-fg-muted md:text-base">{featured.excerpt}</p>
            <PostMeta post={featured} />
            <ButtonLink href={routes.blogPost(featured.slug)} variant="secondary" className="mt-2 self-start">
              Read article
            </ButtonLink>
          </div>
        </article>
      ) : null}

      {rest.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => p && <PostCard key={p.slug} post={p} />)}
        </div>
      ) : !featured ? (
        <EmptyState icon="file-text" title="No articles yet" text="There are no articles in this category yet." action={<ButtonLink href={routes.blog()}>See all articles</ButtonLink>} />
      ) : null}
    </div>
  );
}
