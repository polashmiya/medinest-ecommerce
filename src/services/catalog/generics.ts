import { findGenericEntry } from "@/data/mock/generics";
import type { GenericInfo, GenericSection } from "@/types";

/** Reference notes for a generic, or null when we have none for it. */
export function buildGenericInfo(id: number, genericName: string): GenericInfo | null {
  const entry = findGenericEntry(genericName);
  if (!entry) return null;
  return {
    id,
    name: genericName,
    overview: entry.overview,
    briefDescription: entry.briefDescription,
    quickTips: entry.quickTips,
    safetyAdvices: entry.safetyAdvices,
  };
}

const NAME = /__NAME__/g;

/** Replace the `__NAME__` placeholder in reference notes with the product's name. */
export function personalizeGeneric(info: GenericInfo, productName: string): GenericInfo {
  const fill = (s: string) => s.replace(NAME, productName);
  const section = (s: GenericSection): GenericSection => ({
    title: fill(s.title),
    content:
      typeof s.content === "string"
        ? fill(s.content)
        : Array.isArray(s.content)
          ? s.content.map(fill)
          : { ...s.content, list: s.content.list?.map(fill) },
  });
  return {
    ...info,
    overview: info.overview.map(section),
    briefDescription: info.briefDescription.map((b) => ({ title: fill(b.title), content: fill(b.content) })),
    quickTips: info.quickTips.map(fill),
    safetyAdvices: info.safetyAdvices.map((s) => ({ ...s, content: fill(s.content) })),
  };
}
