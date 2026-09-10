"use client";

import Link from "next/link";
import { AuthenticatedApp } from "@/components/layout/authenticated-app";
import { ClinicalDatasetReportPage } from "@/components/reports/clinical-dataset-report-page";
import { Button } from "@/components/ui/core";

export default function ClinicalDatasetRoutePage() {
  return (
    <AuthenticatedApp>
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
            <Link href="/">
              <Button variant="secondary" size="sm">
                ← Workspace
              </Button>
            </Link>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Clinical Dataset Report
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          <ClinicalDatasetReportPage />
        </main>
      </div>
    </AuthenticatedApp>
  );
}
