import { features } from "@/config/features.config";
import { t } from "@/lib/i18n";
import type { GenericInfo, GenericSection, SafetyAdvice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

type Tone = "danger" | "warning" | "success" | "neutral";

/** Map a safety tag (e.g. "UNSAFE", "CAUTION", "SAFE IF PRESCRIBED") to a badge tone. */
function toneFor(tag: string): Tone {
  const s = tag.toUpperCase();
  if (/UNSAFE|AVOID|NOT RECOMMENDED|DO NOT/.test(s)) return "danger";
  if (/CAUTION|CONSULT|UNKNOWN|WARNING/.test(s)) return "warning";
  if (/SAFE/.test(s)) return "success";
  return "neutral";
}

const toneRing: Record<Tone, string> = {
  danger: "border-danger/30 bg-danger/5",
  warning: "border-warning/40 bg-warning/5",
  success: "border-success/30 bg-success/5",
  neutral: "border-line bg-surface",
};

function SectionContent({ content }: { content: GenericSection["content"] }) {
  if (typeof content === "string") return <p>{content}</p>;
  const list = Array.isArray(content) ? content : content.list ?? [];
  const tag = Array.isArray(content) ? undefined : content.tag;
  return (
    <div>
      {tag ? (
        <Badge tone={toneFor(tag) === "neutral" ? "primary" : toneFor(tag)} className="mb-2">
          {tag}
        </Badge>
      ) : null}
      <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {list.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Icon name="check" className="mt-0.5 size-4 shrink-0 text-primary-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SafetyCard({ advice }: { advice: SafetyAdvice }) {
  const tone = toneFor(advice.tag);
  return (
    <div className={`rounded-xl border p-4 ${toneRing[tone]}`}>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-fg">{advice.type}</p>
        <Badge tone={tone === "neutral" ? "primary" : tone}>{advice.tag}</Badge>
      </div>
      <p className="text-sm text-fg-muted">{advice.content}</p>
    </div>
  );
}

/** Reference notes for the active ingredient: overview, brief facts, tips and safety advice. */
export function MedicineInfo({ info, productName }: { info: GenericInfo; productName: string }) {
  return (
    <>
      {features.medicineOverview ? (
        <section id="overview" className="scroll-mt-40 rounded-2xl border border-line bg-surface p-5 md:p-6" aria-labelledby="overview-title">
          <h2 id="overview-title" className="text-xl font-extrabold tracking-tight text-fg">
            {t("product.overview")}
          </h2>
          <p className="mt-1 text-xs text-fg-subtle">General information about {info.name}. Always follow your doctor&apos;s advice and the leaflet inside the pack.</p>
          <div className="mt-5 space-y-5 text-sm leading-relaxed text-fg-muted">
            {info.overview.map((s) => (
              <div key={s.title}>
                <h3 className="mb-1.5 text-base font-bold text-fg">{s.title}</h3>
                <SectionContent content={s.content} />
              </div>
            ))}
          </div>

          {info.briefDescription.length ? (
            <div className="mt-6">
              <h3 className="mb-2 text-base font-bold text-fg">{t("product.briefDescription")}</h3>
              <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line text-sm">
                {info.briefDescription.map((b) => (
                  <div key={b.title} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    <dt className="font-semibold text-fg">{b.title}</dt>
                    <dd className="text-fg-muted">{b.content}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {info.quickTips.length ? (
            <div className="mt-6 rounded-xl bg-primary/6 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-fg">
                <Icon name="sparkles" className="size-4 text-primary-600" />
                {t("product.quickTips")}
              </h3>
              <ul className="space-y-1.5 text-sm text-fg-muted">
                {info.quickTips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <Icon name="circle-check" className="mt-0.5 size-4 shrink-0 text-success" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {features.safetyAdvice && info.safetyAdvices.length ? (
        <section id="safety" className="scroll-mt-40" aria-labelledby="safety-title">
          <h2 id="safety-title" className="mb-4 flex items-center gap-2 text-xl font-extrabold tracking-tight text-fg">
            <Icon name="shield-check" className="size-5 text-primary-600" />
            {t("product.safetyAdvice")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {info.safetyAdvices.map((a) => (
              <SafetyCard key={`${a.type}-${a.tag}`} advice={a} />
            ))}
          </div>
          <p className="mt-3 text-xs text-fg-subtle">Safety notes are general guidance for {productName} and are not a substitute for professional medical advice.</p>
        </section>
      ) : null}
    </>
  );
}

/** Short factual summary for items without detailed reference notes. */
export function AboutItem({ summary, descriptionHtml, isMedicine }: { summary: string; descriptionHtml?: string; isMedicine: boolean }) {
  return (
    <section id="about" className="scroll-mt-40 rounded-2xl border border-line bg-surface p-5 md:p-6" aria-labelledby="about-title">
      <h2 id="about-title" className="text-xl font-extrabold tracking-tight text-fg">
        {t("product.aboutItem")}
      </h2>
      {descriptionHtml ? (
        <div className="prose-app mt-3 text-sm" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">{summary}</p>
      )}
      {isMedicine ? (
        <ul className="mt-4 grid gap-2 text-sm text-fg-muted sm:grid-cols-2">
          {[
            "Use only as directed by a registered physician or pharmacist.",
            "Check the seal and expiry date on the pack before use.",
            "Store in a cool, dry place away from direct sunlight.",
            "Keep all medicines out of the reach of children.",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <Icon name="info" className="mt-0.5 size-4 shrink-0 text-primary-600" />
              {line}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
