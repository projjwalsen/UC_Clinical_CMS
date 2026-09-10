"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { Badge, Button, Card, Field, Input } from "@/components/ui/core";

export function Login() {
  const { login } = useDemoStore();
  const [email, setEmail] = useState("admin@uccms.demo");
  const [password, setPassword] = useState("Demo@123");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (!login(email, password, remember))
        setError(
          "Incorrect email or password. Use the demo credentials shown below.",
        );
      setLoading(false);
    }, 650);
  };
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden bg-[#0b2630] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-teal-500">
            <HeartPulse />
          </div>
          <div>
            <p className="font-bold">UC Clinical CMS</p>
            <p className="text-xs text-slate-400">Research Data Platform</p>
          </div>
        </div>
        <div className="max-w-xl">
          <Badge tone="teal">Presentation Prototype</Badge>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight">
            Longitudinal ulcerative colitis data, organized for better insight.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            A polished demonstration workspace for patient registration,
            clinical follow-up and cohort analytics.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ["42", "Synthetic patients"],
              ["17", "Clinical modules"],
              ["100%", "Browser based"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-2xl font-bold text-teal-300">{v}</p>
                <p className="mt-1 text-xs text-slate-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="size-4 text-teal-400" />
          Synthetic data only · No clinical use
        </div>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-teal-700 text-white">
              <HeartPulse />
            </div>
            <p className="font-bold">UC Clinical CMS</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">
                Welcome back
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Sign in to continue
              </h2>
            </div>
            <Badge tone="teal">Demo Mode</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Access the synthetic patient-data workspace.
          </p>
          <form onSubmit={submit} className="mt-7 space-y-5">
            <Field label="Email address" required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoComplete="email"
                />
              </div>
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {show ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </Field>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() =>
                  setError(
                    "Password recovery is disabled in this frontend-only demo.",
                  )
                }
                className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                Forgot password?
              </button>
            </div>
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Verifying demo credentials…" : "Sign in to dashboard"}
            </Button>
          </form>
          <Card className="mt-6 border-teal-100 bg-teal-50/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
              Demo credentials
            </p>
            <div className="mt-3 grid grid-cols-[80px_1fr] gap-y-2 text-sm">
              <span className="text-teal-700">Email</span>
              <code className="font-semibold text-teal-950">
                admin@uccms.demo
              </code>
              <span className="text-teal-700">Password</span>
              <code className="font-semibold text-teal-950">Demo@123</code>
            </div>
          </Card>
          <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
            Frontend presentation prototype. No real authentication or
            patient-data transmission occurs.
          </p>
        </div>
      </section>
    </main>
  );
}
