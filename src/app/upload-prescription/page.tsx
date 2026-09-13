import { notFound } from "next/navigation";
import { features } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/display";
import { Icon } from "@/components/ui/icon";
import { ServiceHero, Steps } from "@/components/content/content-ui";
import { PrescriptionUploader } from "@/components/content/prescription-uploader";

export const metadata = pageMetadata({
  title: "Upload prescription",
  description: `Upload a photo of your prescription and ${siteConfig.name}'s pharmacists will prepare your order. Get discounts and home delivery on prescription medicines.`,
  path: routes.uploadPrescription(),
});

const steps = [
  { title: "Take a clear photo", text: "Capture the whole prescription in good light, with the doctor's details visible.", icon: "camera" },
  { title: "Upload it here", text: "Add up to five images and an optional note about quantities.", icon: "upload" },
  { title: "Pharmacist review", text: "A licensed pharmacist checks the prescription and prepares your medicines.", icon: "shield-check" },
  { title: "Doorstep delivery", text: "We confirm the order with you and deliver it to your address.", icon: "truck" },
];

const valid = [
  "Doctor's name, qualification and registration number",
  "Patient's name and age",
  "Date of the prescription",
  "Medicine names, strength and dosage",
  "Doctor's signature or stamp",
];

export default function UploadPrescriptionPage() {
  if (!features.prescriptionUpload) notFound();
  return (
    <div className="container-app py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Upload prescription" }]} className="mb-5" />
      <ServiceHero
        eyebrow="Prescription orders"
        title="Upload your prescription, we'll do the rest"
        text="Our pharmacists read your prescription, prepare the medicines and deliver them to your door — often with savings on the MRP."
        cover={{ from: "var(--p-900)", to: "var(--p-500)", icon: "file-text" }}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <PrescriptionUploader />
        <aside className="space-y-5">
          <div className="card p-5">
            <p className="flex items-center gap-2 font-bold text-fg">
              <Icon name="badge-check" className="size-5 text-success" /> What makes a prescription valid?
            </p>
            <ul className="mt-3 space-y-2 text-sm text-fg-muted">
              {valid.map((v) => (
                <li key={v} className="flex items-start gap-2">
                  <Icon name="check" className="mt-0.5 size-4 shrink-0 text-success" /> {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <p className="flex items-center gap-2 font-bold text-fg">
              <Icon name="headphones" className="size-5 text-primary-600" /> Prefer to talk?
            </p>
            <p className="mt-2 text-sm text-fg-muted">Call our pharmacy team and we&apos;ll help you place the order.</p>
            <a href={siteConfig.contact.hotlineHref} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:underline dark:text-primary-300">
              <Icon name="phone" className="size-4" /> {siteConfig.contact.hotline}
            </a>
            <p className="mt-1 text-xs text-fg-subtle">{siteConfig.contact.supportHours}</p>
          </div>
        </aside>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-extrabold tracking-tight text-fg md:text-xl">How it works</h2>
        <Steps steps={steps} />
      </section>
    </div>
  );
}
