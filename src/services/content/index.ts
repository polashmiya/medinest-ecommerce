import "server-only";
import { cache } from "react";
import { blogPosts, contentPages, doctors, doctorSpecialties, labPackages, labTests } from "@/data/mock/content";
import type { BlogPost, ContentPage, Doctor, DoctorSpecialty, LabPackage, LabTest } from "./types";

export type * from "./types";

/**
 * Editorial and service content. The mock provider reads `data/mock/content.ts`;
 * set CONTENT_API_URL to fetch the same shapes from a CMS or backend instead.
 *
 *   GET /blog?category=&limit=   → BlogPost[]
 *   GET /blog/:slug              → BlogPost
 *   GET /pages                   → ContentPage[]  (slug list derived from it)
 *   GET /pages/:slug             → ContentPage
 *   GET /lab-tests?category=     → LabTest[]
 *   GET /lab-packages            → LabPackage[]
 *   GET /doctors/specialties     → DoctorSpecialty[]
 *   GET /doctors?specialty=      → Doctor[]
 */
export interface ContentService {
  getBlogPosts(opts?: { category?: string; limit?: number }): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;
  getRelatedPosts(slug: string, limit?: number): Promise<BlogPost[]>;
  getPage(slug: string): Promise<ContentPage | null>;
  getPageSlugs(): Promise<string[]>;
  getPages(): Promise<Pick<ContentPage, "slug" | "title">[]>;
  getLabTests(opts?: { category?: string }): Promise<LabTest[]>;
  getLabPackages(): Promise<LabPackage[]>;
  getDoctorSpecialties(): Promise<DoctorSpecialty[]>;
  getDoctors(opts?: { specialty?: string }): Promise<Doctor[]>;
}

const byDate = (a: BlogPost, b: BlogPost) => b.publishedAt.localeCompare(a.publishedAt);

const mockContent: ContentService = {
  async getBlogPosts(opts = {}) {
    const list = blogPosts.filter((p) => !opts.category || p.category === opts.category).sort(byDate);
    return opts.limit ? list.slice(0, opts.limit) : list;
  },
  async getBlogPost(slug) {
    return blogPosts.find((p) => p.slug === slug) ?? null;
  },
  async getRelatedPosts(slug, limit = 3) {
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return [];
    const score = (p: BlogPost) => (p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length;
    return blogPosts
      .filter((p) => p.slug !== slug)
      .sort((a, b) => score(b) - score(a) || byDate(a, b))
      .slice(0, limit);
  },
  async getPage(slug) {
    return contentPages.find((p) => p.slug === slug) ?? null;
  },
  async getPageSlugs() {
    return contentPages.map((p) => p.slug);
  },
  async getPages() {
    return contentPages.map(({ slug, title }) => ({ slug, title }));
  },
  async getLabTests(opts = {}) {
    return labTests.filter((t) => !opts.category || t.category === opts.category);
  },
  async getLabPackages() {
    return labPackages;
  },
  async getDoctorSpecialties() {
    return doctorSpecialties;
  },
  async getDoctors(opts = {}) {
    return doctors.filter((d) => !opts.specialty || d.specialtyId === opts.specialty);
  },
};

const BASE = process.env.CONTENT_API_URL?.replace(/\/$/, "") ?? "";

async function get<T>(path: string, fallback: T): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { accept: "application/json" }, next: { revalidate: 600, tags: ["content"] } });
  if (res.status === 404) return fallback;
  if (!res.ok) throw new Error(`Content API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

const qs = (params: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

const httpContent: ContentService = {
  getBlogPosts: (opts = {}) => get(`/blog${qs(opts)}`, []),
  getBlogPost: (slug) => get(`/blog/${encodeURIComponent(slug)}`, null),
  getRelatedPosts: (slug, limit) => get(`/blog/${encodeURIComponent(slug)}/related${qs({ limit })}`, []),
  getPage: (slug) => get(`/pages/${encodeURIComponent(slug)}`, null),
  getPageSlugs: async () => (await get<ContentPage[]>("/pages", [])).map((p) => p.slug),
  getPages: async () => (await get<ContentPage[]>("/pages", [])).map(({ slug, title }) => ({ slug, title })),
  getLabTests: (opts = {}) => get(`/lab-tests${qs(opts)}`, []),
  getLabPackages: () => get("/lab-packages", []),
  getDoctorSpecialties: () => get("/doctors/specialties", []),
  getDoctors: (opts = {}) => get(`/doctors${qs(opts)}`, []),
};

const provider: ContentService = process.env.CONTENT_API_URL ? httpContent : mockContent;

/** Per-request memoised content access for pages and metadata. */
export const content: ContentService = {
  getBlogPosts: cache(provider.getBlogPosts),
  getBlogPost: cache(provider.getBlogPost),
  getRelatedPosts: cache(provider.getRelatedPosts),
  getPage: cache(provider.getPage),
  getPageSlugs: provider.getPageSlugs,
  getPages: cache(provider.getPages),
  getLabTests: cache(provider.getLabTests),
  getLabPackages: cache(provider.getLabPackages),
  getDoctorSpecialties: cache(provider.getDoctorSpecialties),
  getDoctors: cache(provider.getDoctors),
};
