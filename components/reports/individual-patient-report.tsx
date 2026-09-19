"use client";

import Link from "next/link";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { buildClinicalReportRows } from "@/lib/report-data-join";
import { validateClinicalDatasetRecord } from "@/lib/report-validation";
import { RecordValidationPanel } from "@/components/reports/record-validation-panel";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui/core";
import {
  formatComorbidities,
  formatDlqiChangeDisplay,
  formatMultiTherapy,
  DISEASE_ACTIVITY_LABELS,
  IBD_TYPE_LABELS,
  DISEASE_LOCATION_LABELS,
  FOLLOW_UP_RESPONSE_LABELS,
} from "@/lib/report-labels";
import { formatDurationMonths } from "@/lib/report-calculations";
import { formatDate } from "@/lib/utils";
import { getPatientDisplayPhone } from "@/lib/patient-contact";

export function IndividualPatientReport({ patientId }: { patientId: string }) {
  const { patients, clinicalDatasetRecords } = useDemoStore();
  const patient = patients.find((p) => p.id === patientId);
  const row = buildClinicalReportRows(patients, clinicalDatasetRecords).find(
    (r) => r.patientId === patientId,
  );

  if (!patient) {
    return (
      <EmptyState
        title="Patient not found"
        description="Return to the patient directory or clinical dataset report."
      />
    );
  }

  const issues = row
    ? validateClinicalDatasetRecord(row, patient, clinicalDatasetRecords)
    : [];

  const printReport = () => window.print();

  return (
    <div id="individual-patient-report" className="print:text-sm">
      <style jsx global>{`
        @media print {
          .no-print-individual {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print-individual mb-4 flex flex-wrap gap-2">
        <Link href={`/patients/${patientId}`}>
          <Button variant="secondary">
            <ArrowLeft className="size-4" />
            Back to patient
          </Button>
        </Link>
        <Button variant="secondary" onClick={printReport}>
          <Printer className="size-4" />
          Print
        </Button>
        <Button variant="secondary" onClick={printReport}>
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        Synthetic demonstration data — browser-generated PDF uses print-to-PDF; no
        data is sent to a server.
      </div>

      <PageHeader
        eyebrow="Individual report"
        title={patient.name}
        description={`${patient.id} · ${patient.ibdCode ?? "No IBD code"} · Generated ${formatDate(new Date().toISOString().slice(0, 10))}`}
      />

      {!row ? (
        <EmptyState
          title="No clinical dataset record"
          description="Add a clinical dataset entry from the patient profile tab."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Patient identification">
            <Row label="IBD code" value={row.ibdCode} />
            <Row label="Patient ID" value={patient.id} />
            <Row label="Name" value={patient.name} />
            <Row label="Phone (default contact)" value={getPatientDisplayPhone(patient)} />
          </Section>
          <Section title="Demographics">
            <Row label="Age" value={String(patient.age)} />
            <Row label="Sex" value={patient.gender} />
            <Row label="Registration" value={formatDate(patient.registrationDate)} />
          </Section>
          <Section title="IBD profile">
            <Row
              label="IBD type"
              value={row.ibdType ? IBD_TYPE_LABELS[row.ibdType] : "Not recorded"}
            />
            <Row
              label="Disease location"
              value={
                row.diseaseLocation
                  ? DISEASE_LOCATION_LABELS[row.diseaseLocation]
                  : "Not recorded"
              }
            />
            <Row label="Age at diagnosis" value={String(row.ageAtDiagnosis ?? "Not recorded")} />
            <Row
              label="Illness duration"
              value={formatDurationMonths(row.illnessDurationMonths)}
            />
          </Section>
          <Section title="Current disease status">
            <Row
              label="Disease activity"
              value={
                row.diseaseActivity
                  ? DISEASE_ACTIVITY_LABELS[row.diseaseActivity]
                  : "Not recorded"
              }
            />
            <Row label="Comorbidity" value={formatComorbidities(row)} />
          </Section>
          <Section title="Treatment">
            <Row label="Current therapy" value={formatMultiTherapy(row.currentTherapies)} />
            <Row
              label="Therapy duration"
              value={formatDurationMonths(row.therapyDurationMonths)}
            />
          </Section>
          <Section title="Skin manifestations">
            <Row
              label="Manifestations"
              value={
                row.skinManifestations.length
                  ? row.skinManifestations.join(", ")
                  : "Not recorded"
              }
            />
          </Section>
          <Section title="Nutritional deficiencies">
            <Row
              label="Deficiencies"
              value={
                row.nutritionalDeficiencies.length
                  ? row.nutritionalDeficiencies.join(", ")
                  : "Not recorded"
              }
            />
          </Section>
          <Section title="Treatment-associated adverse effects">
            <Row
              label="Adverse effects"
              value={
                row.therapyAdverseEffects.length
                  ? row.therapyAdverseEffects.map(String).join(", ")
                  : "Not recorded"
              }
            />
          </Section>
          <Section title="Biopsy and extra-intestinal findings">
            <Row
              label="Skin biopsy"
              value={
                row.skinBiopsyPerformed === 1
                  ? "Yes"
                  : row.skinBiopsyPerformed === 2
                    ? "No"
                    : "Not recorded"
              }
            />
            <Row
              label="Extra-intestinal"
              value={
                row.extraintestinalManifestations.length
                  ? row.extraintestinalManifestations.join(", ")
                  : "Not recorded"
              }
            />
          </Section>
          <Section title="Follow-up response">
            <Row
              label="Oro-cutaneous response"
              value={
                row.followUpResponse
                  ? FOLLOW_UP_RESPONSE_LABELS[row.followUpResponse]
                  : "Not recorded"
              }
            />
          </Section>
          <Section title="DLQI scores">
            <Row
              label="At presentation"
              value={String(row.dlqiAtPresentation ?? "Not recorded")}
            />
            <Row
              label="At follow-up"
              value={String(row.dlqiAtFollowUp ?? "Not recorded")}
            />
            <Row
              label="Change"
              value={formatDlqiChangeDisplay(
                row.dlqiAtPresentation,
                row.dlqiAtFollowUp,
              )}
            />
          </Section>
          <Section title="Data completeness">
            <div className="flex items-center gap-2">
              {row.recordStatus === "complete" && (
                <Badge tone="green">Complete</Badge>
              )}
              {row.recordStatus === "incomplete" && (
                <Badge tone="amber">Incomplete</Badge>
              )}
              {row.recordStatus === "review-required" && (
                <Badge tone="red">Review required</Badge>
              )}
            </div>
            {issues.length > 0 && (
              <div className="mt-3">
                <RecordValidationPanel issues={issues} />
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <dl className="mt-3 space-y-2">{children}</dl>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="text-right text-slate-800">{value}</dd>
    </div>
  );
}
