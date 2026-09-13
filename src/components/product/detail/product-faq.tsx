import { features } from "@/config/features.config";
import { t } from "@/lib/i18n";
import { Disclosure, JsonLd } from "@/components/ui/display";

export interface FaqItem {
  q: string;
  a: string;
}

/** Product questions rendered as <details> (crawlable) plus FAQPage structured data. */
export function ProductFaq({ items }: { items: FaqItem[] }) {
  if (!features.productFaq || !items.length) return null;
  return (
    <section id="faq" className="scroll-mt-40" aria-labelledby="faq-title">
      <h2 id="faq-title" className="mb-2 text-xl font-extrabold tracking-tight text-fg">
        {t("product.faq")}
      </h2>
      <div className="rounded-2xl border border-line bg-surface px-5">
        {items.map((f, i) => (
          <Disclosure key={f.q} summary={f.q} defaultOpen={i === 0}>
            {f.a}
          </Disclosure>
        ))}
      </div>
      {features.jsonLd ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      ) : null}
    </section>
  );
}
