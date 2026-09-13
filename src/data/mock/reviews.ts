import type { Review } from "@/types";
import { seeded } from "@/lib/utils";

const NAMES = [
  "Rahim U.", "Nusrat J.", "Tanvir A.", "Farhana K.", "Sabbir H.", "Mitu R.", "Arif M.", "Sadia I.", "Imran C.", "Tasnim F.",
  "Rafi S.", "Jannat B.", "Shuvo D.", "Anika T.", "Mahmud N.", "Priya S.", "Kamrul H.", "Lamia Z.", "Omar F.", "Rumana P.",
];
const TEXTS: Record<number, string[]> = {
  5: ["Genuine product and delivered the next morning.", "Exactly as described. Packaging was sealed.", "Great price compared to my local pharmacy.", "Fast delivery and the rider was polite.", "Ordering again every month. Reliable service.", "Expiry date was far away. Very happy."],
  4: ["Good product, delivery took a little longer than expected.", "Works well. Would love more discount.", "Nice packaging, arrived safely.", "Satisfied overall, will reorder."],
  3: ["Product is fine but the box was slightly dented.", "Average experience, delivery was late by a day."],
};

/** Deterministic mock reviews derived from the product's rating summary. */
export function generateReviews(productId: number, variantId: number, average: number, count: number, limit = 12): Review[] {
  if (!count) return [];
  const rand = seeded(productId);
  const n = Math.min(limit, count);
  const out: Review[] = [];
  const base = Date.UTC(2026, 7, 30);
  for (let i = 0; i < n; i++) {
    const r = rand();
    const rating = average >= 4.6 ? (r < 0.85 ? 5 : 4) : average >= 4 ? (r < 0.55 ? 5 : r < 0.9 ? 4 : 3) : r < 0.5 ? 4 : 3;
    const pool = TEXTS[rating] ?? TEXTS[5];
    out.push({
      id: `${productId}-${i}`,
      productId,
      variantId,
      rating,
      text: rand() < 0.2 ? "" : pool[Math.floor(rand() * pool.length)],
      userName: NAMES[Math.floor(rand() * NAMES.length)],
      createdAt: new Date(base - Math.floor(rand() * 180) * 86_400_000 - i * 3_600_000).toISOString(),
      verified: rand() < 0.8,
    });
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
