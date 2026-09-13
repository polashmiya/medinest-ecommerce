import { notFound } from "next/navigation";
import { features } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { content } from "@/services/content";
import { Breadcrumbs, JsonLd } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ServiceHero, Steps } from "@/components/content/content-ui";
import { DoctorDirectory } from "@/components/content/doctors";

export const metadata = pageMetadata({
  title: "Online doctor consultation",
  description: `Talk to qualified doctors by video from home with ${siteConfig.name}. General physicians, child specialists, women's health, skin, heart and more.`,
  path: routes.doctor(),
});

const steps = [
  { title: "Pick a doctor", text: "Filter by specialty and choose a time that suits you.", icon: "stethoscope" },
  { title: "Share your concern", text: "Tell the doctor about your symptoms before the call.", icon: "file-text" },
  { title: "Video consultation", text: "Join the call from your phone; no travel or waiting room.", icon: "video" },
  { title: "Get your prescription", text: "Receive an e-prescription and order medicines in one tap.", icon: "pill" },
];

export default async function DoctorConsultationPage() {
  if (!features.doctorConsultation) notFound();
  const [doctors, specialties] = await Promise.all([content.getDoctors(), content.getDoctorSpecialties()]);
  const minFee = Math.min(...doctors.map((d) => d.fee));
  const crumbs = [{ label: "Home", href: "/" }, { label: "Doctor consultation" }];

  return (
    <div className="container-app py-6 md:py-8">
      <Breadcrumbs items={crumbs} className="mb-5" />
      <ServiceHero
        eyebrow="Telemedicine"
        title="See a doctor from home"
        text={`Video consultations with qualified doctors, from ${formatPrice(minFee)}. Get advice, an e-prescription and your medicines delivered.`}
        cover={{ from: "#9d174d", to: "#f472b6", icon: "stethoscope" }}
        aside={
          <ul className="space-y-3 rounded-2xl bg-white/15 p-5 text-sm backdrop-blur-sm">
            {["Doctors available 7 days a week", "Private, secure video calls", "E-prescription after the call"].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <Icon name="circle-check" className="size-4 shrink-0" /> {x}
              </li>
            ))}
          </ul>
        }
      />

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-fg">
        <Icon name="info" className="mt-0.5 size-4 shrink-0 text-warning" />
        Demo service: the doctors listed here are fictional and bookings are stored only on this device. No real consultation is arranged.
      </p>

      <DoctorDirectory doctors={doctors} specialties={specialties} />

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-extrabold tracking-tight text-fg md:text-xl">How online consultation works</h2>
        <Steps steps={steps} />
      </section>

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </div>
  );
}
