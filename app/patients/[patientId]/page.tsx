"use client";

import { use } from "react";
import { AuthenticatedApp } from "@/components/layout/authenticated-app";
import { PatientProfile } from "@/components/patients/patient-profile";
import Link from "next/link";
import { Button } from "@/components/ui/core";

export default function PatientRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { patientId } = use(params);
  const { tab } = use(searchParams);

  return (
    <AuthenticatedApp>
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3">
            <Link href="/">
              <Button variant="secondary" size="sm">
                ← Workspace
              </Button>
            </Link>
            <Link href="/reports/clinical-dataset">
              <Button variant="ghost" size="sm">
                Clinical dataset report
              </Button>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          <PatientProfile
            patientId={patientId}
            onBack={() => {
              window.location.href = "/";
            }}
            initialTab={tab === "clinical-dataset" ? "clinical-dataset" : undefined}
          />
        </main>
      </div>
    </AuthenticatedApp>
  );
}
