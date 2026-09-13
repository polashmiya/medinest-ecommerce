import { notFound } from "next/navigation";
import { features } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { content } from "@/services/content";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs, JsonLd, SectionHeader } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ContentBlocks, CoverArtwork, PostCard, PostMeta } from "@/components/content/content-ui";
import { ShareButtons } from "@/components/content/share-buttons";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await content.getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await content.getBlogPost(slug);
  if (!post) return {};
  const meta = pageMetadata({ title: post.title, description: post.excerpt, path: routes.blogPost(post.slug) });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: "article" as const, publishedTime: post.publishedAt, authors: [post.author], section: post.category, tags: post.tags },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  if (!features.blog) notFound();
  const { slug } = await params;
  const post = await content.getBlogPost(slug);
  if (!post) notFound();
  const related = await content.getRelatedPosts(post.slug, 3);
  const url = new URL(routes.blogPost(post.slug), siteConfig.url).toString();
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: routes.blog() },
    { label: post.category, href: `${routes.blog()}?category=${encodeURIComponent(post.category)}` },
    { label: post.title },
  ];

  return (
    <div className="container-app py-6 md:py-8">
      <Breadcrumbs items={crumbs} className="mb-5" />
      <article className="mx-auto max-w-3xl">
        <header>
          <Badge tone="primary">{post.category}</Badge>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-fg md:text-4xl">{post.title}</h1>
          <p className="mt-3 text-base text-fg-muted md:text-lg">{post.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
            <PostMeta post={post} />
            <ShareButtons title={post.title} url={url} />
          </div>
        </header>
        <CoverArtwork cover={post.cover} className="my-6 aspect-[21/9] rounded-2xl" iconClassName="size-14" />
        <ContentBlocks blocks={post.body} className="text-[0.975rem]" />
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-fg-muted">
              #{t}
            </span>
          ))}
        </div>

        <aside className="mt-10 flex flex-col items-start gap-4 rounded-2xl bg-primary/8 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-fg">
              <Icon name="pill" className="size-5" />
            </span>
            <div>
              <p className="font-bold text-fg">Need medicines or health essentials?</p>
              <p className="text-sm text-fg-muted">Order authentic products with fast home delivery, or ask our pharmacists.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonLink href={routes.categories()}>Shop now</ButtonLink>
            {features.prescriptionUpload ? (
              <ButtonLink href={routes.uploadPrescription()} variant="outline">
                Upload prescription
              </ButtonLink>
            ) : null}
          </div>
        </aside>
      </article>

      {related.length ? (
        <section className="mt-14">
          <SectionHeader title="Keep reading" href={routes.blog()} linkLabel="All articles" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            author: { "@type": "Organization", name: post.author },
            publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
            mainEntityOfPage: url,
            articleSection: post.category,
            keywords: post.tags.join(", "),
          },
          breadcrumbJsonLd(crumbs),
        ]}
      />
    </div>
  );
}
