"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site.config";
import { routes } from "@/lib/routes";
import { useT } from "@/lib/use-t";
import { isValidBdPhone, normalizePhone } from "@/lib/utils";
import { useAuthStore, useHydrated, useNotificationStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/layout/logo";

const RESEND_SECONDS = 30;

/**
 * Mock OTP login. `sendOtp` / `verify` are the two calls to replace with a
 * real auth API; the demo shows the generated code on screen.
 */
export function LoginView({ next }: { next: string }) {
  const t = useT();
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const notify = useNotificationStore((s) => s.push);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const loggingIn = useRef(false);
  const otpInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hydrated && user && !loggingIn.current) router.replace(next);
  }, [hydrated, user, next, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const sendOtp = () => {
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setOtp(generated);
    setCode("");
    setSeconds(RESEND_SECONDS);
    setStep("otp");
    setError(null);
    requestAnimationFrame(() => otpInput.current?.focus());
  };

  const submitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidBdPhone(phone)) {
      setError(t("checkout.invalidPhone"));
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      sendOtp();
    }, 500);
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() !== otp) {
      setError("That code doesn't match. Check the code and try again.");
      return;
    }
    loggingIn.current = true;
    const normalized = normalizePhone(phone);
    const existing = useAuthStore.getState().user;
    login(normalized, name);
    if (!existing || existing.phone !== normalized) {
      notify({ title: `Welcome to ${siteConfig.name}`, body: "Upload a prescription, track orders and save addresses from your account.", href: routes.account() });
    }
    router.replace(next === routes.login() ? routes.account() : next);
  };

  return (
    <div className="container-app grid min-h-[70vh] place-items-center py-10">
      <div className="card w-full max-w-md p-6 md:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo compact />
          <h1 className="mt-4 text-xl font-extrabold tracking-tight text-fg">{t("account.loginTitle")}</h1>
          <p className="mt-1 text-sm text-fg-muted">{step === "phone" ? t("account.loginText") : t("account.otpSent", { phone })}</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={submitPhone} className="space-y-4" noValidate>
            <Field label={t("checkout.phone")} htmlFor="login-phone" error={error}>
              <div className="flex">
                <span className="grid h-11 place-items-center rounded-l-lg border border-r-0 border-line bg-muted px-3 text-sm font-semibold text-fg-muted">+88</span>
                <Input
                  id="login-phone"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/[^\d+\s-]/g, "")); setError(null); }}
                  placeholder={t("account.phonePlaceholder")}
                  inputMode="tel"
                  autoComplete="tel"
                  autoFocus
                  aria-invalid={Boolean(error)}
                  className="rounded-l-none"
                />
              </div>
            </Field>
            <Field label={<>Your name <span className="font-normal text-fg-subtle">({t("common.optional")})</span></>} htmlFor="login-name">
              <Input id="login-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="How should we address you?" />
            </Field>
            <Button type="submit" size="lg" className="w-full" loading={busy}>
              {t("account.sendOtp")}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4" noValidate>
            <p className="rounded-lg bg-warning/12 px-3 py-2 text-center text-sm text-fg">
              {t("account.demoOtp", { code: otp })}
            </p>
            <Field label="Verification code" htmlFor="login-otp" error={error}>
              <Input
                ref={otpInput}
                id="login-otp"
                value={code}
                onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(null); }}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                aria-invalid={Boolean(error)}
                className="text-center font-mono text-lg tracking-[0.5em]"
              />
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6}>
              {t("account.verify")}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => { setStep("phone"); setError(null); }} className="inline-flex items-center gap-1 font-semibold text-fg-muted hover:text-fg">
                <Icon name="arrow-left" className="size-4" /> Change number
              </button>
              <button type="button" onClick={sendOtp} disabled={seconds > 0} className="font-semibold text-primary-600 hover:underline disabled:text-fg-subtle disabled:no-underline">
                {seconds > 0 ? `${t("account.resend")} in ${seconds}s` : t("account.resend")}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-fg-subtle">
          By continuing you agree to our{" "}
          <Link href={routes.page("tos")} className="underline hover:text-fg">
            terms
          </Link>{" "}
          and{" "}
          <Link href={routes.page("privacy")} className="underline hover:text-fg">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
