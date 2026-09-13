/** Content entities (blog, info pages, lab tests, doctors). Mirror what a CMS / API would return. */

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "note"; text: string };

export interface CoverArt {
  from: string;
  to: string;
  /** Icon registry name drawn on the cover. */
  icon: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readMinutes: number;
  cover: CoverArt;
  tags: string[];
  body: ContentBlock[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ContentPage {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  /** Pages with special rendering: FAQ accordion or the delivery zones table. */
  kind: "default" | "faq" | "delivery";
  blocks: ContentBlock[];
  faqs?: FaqItem[];
}

export interface LabTest {
  id: number;
  slug: string;
  name: string;
  category: string;
  sampleType: string;
  reportIn: string;
  price: number;
  mrp: number;
  preparation: string;
  includes: string[];
  popular?: boolean;
}

export interface LabPackage {
  id: number;
  slug: string;
  name: string;
  forWhom: string;
  tests: string[];
  parameters: number;
  price: number;
  mrp: number;
  cover: CoverArt;
}

export interface DoctorSpecialty {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Doctor {
  id: number;
  name: string;
  initials: string;
  specialtyId: string;
  qualifications: string;
  experienceYears: number;
  languages: string[];
  fee: number;
  rating: number;
  consultations: number;
  nextSlot: string;
  slots: string[];
}
