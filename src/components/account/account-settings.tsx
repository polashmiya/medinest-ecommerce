"use client";

import { useState } from "react";
import { cartConfig } from "@/config/commerce.config";
import { features } from "@/config/features.config";
import { supportedLocales } from "@/config/labels.config";
import { colorPresets, fontOptions } from "@/config/theme.config";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";
import { toast, useSettingsStore, useUiStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Modal } from "@/components/ui/overlay";
import { AccountHeading } from "./account-shell";

const PREFS_KEY = "medinest.prefs.v1";

interface Prefs {
  orderSms: boolean;
  offersEmail: boolean;
  refillReminders: boolean;
  newsletter: boolean;
}

const defaultPrefs: Prefs = { orderSms: true, offersEmail: false, refillReminders: true, newsletter: false };

/** Only rendered on the client (the account shell waits for hydration), so storage is available. */
function readPrefs(): Prefs {
  try {
    const raw = typeof window === "undefined" ? null : localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs, ...(JSON.parse(raw) as Partial<Prefs>) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

const prefRows: { key: keyof Prefs; label: string; hint: string }[] = [
  { key: "orderSms", label: "Order updates by SMS", hint: "Confirmation, dispatch and delivery messages" },
  { key: "refillReminders", label: "Refill reminders", hint: "A nudge before your regular medicines run out" },
  { key: "offersEmail", label: "Offers by email", hint: "Coupons and seasonal deals, at most weekly" },
  { key: "newsletter", label: "Health tips newsletter", hint: "Pharmacist-written wellness articles" },
];

function Section({ title, icon, children }: { title: string; icon: IconName; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-fg">
        <Icon name={icon} className="size-5 text-primary-600" /> {title}
      </h2>
      {children}
    </section>
  );
}

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        <span className="block text-xs text-fg-subtle">{hint}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-line transition peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary-500 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" aria-hidden />
    </label>
  );
}

export function AccountSettings() {
  const t = useT();
  const open = useUiStore((s) => s.open);
  const settings = useSettingsStore((s) => s.settings);
  const set = useSettingsStore((s) => s.set);
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const [confirmClear, setConfirmClear] = useState(false);

  const updatePref = (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const clearDevice = () => {
    try {
      for (const key of Object.values(cartConfig.storageKeys)) localStorage.removeItem(key);
      localStorage.removeItem(PREFS_KEY);
      localStorage.removeItem("medinest.inbox-seeded.v1");
    } catch {
      /* storage unavailable */
    }
    // Full reload (not client navigation) so every in-memory store starts empty.
    window.location.replace(new URL("/", window.location.origin).href);
  };

  const preset = colorPresets.find((p) => p.id === settings.colorPreset);
  const font = fontOptions.find((f) => f.id === settings.font);

  return (
    <div className="space-y-4">
      <AccountHeading title={t("account.settings")} subtitle="Personalise how the store looks and how we contact you." />

      <Section title={t("settings.title")} icon="palette">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex -space-x-1.5">
              <span className="size-6 rounded-full ring-2 ring-surface" style={{ background: preset?.primary[600] }} />
              <span className="size-6 rounded-full ring-2 ring-surface" style={{ background: preset?.accent[500] }} />
            </span>
            <span className="text-fg-muted">
              {preset?.label} · {font?.label} · {settings.mode === "system" ? t("settings.system") : settings.mode === "dark" ? t("settings.dark") : t("settings.light")} mode
            </span>
          </div>
          <Button variant="outline" onClick={() => open("settings")}>
            <Icon name="sliders" className="size-4" /> Customise display
          </Button>
        </div>
      </Section>

      {features.languageSwitcher ? (
        <Section title={t("settings.language")} icon="languages">
          <div role="radiogroup" aria-label={t("settings.language")} className="flex flex-wrap gap-2">
            {supportedLocales.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={settings.locale === l.id}
                onClick={() => set("locale", l.id)}
                className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition", settings.locale === l.id ? "border-primary-500 bg-primary/10 text-primary-700 dark:text-primary-300" : "border-line text-fg-muted hover:border-primary-300")}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-fg-subtle">Translations cover the main shopping flow; untranslated text falls back to English.</p>
        </Section>
      ) : null}

      <Section title={t("account.notifications")} icon="bell">
        <div className="divide-y divide-line">
          {prefRows.map((r) => (
            <Switch key={r.key} label={r.label} hint={r.hint} checked={prefs[r.key]} onChange={(v) => { updatePref(r.key, v); toast({ title: "Preference saved" }); }} />
          ))}
        </div>
      </Section>

      <Section title="Privacy & data" icon="lock">
        <p className="text-sm text-fg-muted">This demo keeps your cart, orders, addresses and prescriptions in this browser only. Clearing removes everything from this device and signs you out.</p>
        <Button variant="outline" className="mt-4 text-danger hover:border-danger/40" onClick={() => setConfirmClear(true)}>
          <Icon name="trash" className="size-4" /> Clear all data on this device
        </Button>
      </Section>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all data?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={clearDevice}>
              Clear everything
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">Your cart, wishlist, orders, addresses, prescriptions, notifications and display settings will be permanently removed from this browser.</p>
      </Modal>
    </div>
  );
}
