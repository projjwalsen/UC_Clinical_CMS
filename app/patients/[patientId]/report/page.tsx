"use client";

import { use } from "react";
import { AuthenticatedApp } from "@/components/layout/authenticated-app";
import { IndividualPatientReport } from "@/components/reports/individual-patient-report";

export default function PatientReportRoutePage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);

  return (
    <AuthenticatedApp>
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-[1200px] p-4 md:p-6">
          <IndividualPatientReport patientId={patientId} />
        </main>
      </div>
    </AuthenticatedApp>
  );
}
