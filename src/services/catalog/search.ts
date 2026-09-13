import { catalogConfig } from "@/config/catalog.config";

/** Lower-case, strip punctuation and collapse whitespace. */
export function normalize(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s.+-]/gu, " ").replace(/\s+/g, " ").trim();
}

export function tokenize(text: string) {
  return normalize(text).split(" ").filter(Boolean);
}

export interface SearchDoc {
  name: string;
  genericName: string;
  brandName: string;
  categoryName: string;
  tags: string[];
}

/**
 * Weighted token scoring used by the mock provider. A real backend would use a
 * search engine; this keeps results relevant for local data:
 * exact name > name prefix > token prefix in name > generic/brand/category/tag.
 */
export function scoreDoc(doc: SearchDoc, query: string, tokens = tokenize(query)): number {
  if (!tokens.length) return 0;
  const w = catalogConfig.search.weights;
  const name = normalize(doc.name);
  const fields: [string, number][] = [
    [name, w.name],
    [normalize(doc.genericName), w.genericName],
    [normalize(doc.brandName), w.brandName],
    [normalize(doc.categoryName), w.categoryName],
    [doc.tags.join(" "), w.tags],
  ];
  const q = normalize(query);
  let score = 0;
  if (name === q) score += 50;
  else if (name.startsWith(q)) score += 25;

  for (const token of tokens) {
    let best = 0;
    for (const [value, weight] of fields) {
      if (!value) continue;
      if (value.split(" ").some((word) => word.startsWith(token))) best = Math.max(best, weight * 2);
      else if (value.includes(token)) best = Math.max(best, weight);
    }
    // Every token must match somewhere, otherwise the document is not a hit.
    if (!best) return 0;
    score += best;
  }
  return score;
}
