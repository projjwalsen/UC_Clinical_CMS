"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, FileText } from "lucide-react";
import { toast } from "sonner";
import { useDemoStore } from "@/lib/demo-store";
import type { Patient } from "@/types/clinical";
import type { ClinicalDatasetRecord } from "@/types/clinical-report";
import { validateClinicalDatasetRecord } from "@/lib/report-validation";
import { RecordValidationPanel } from "@/components/reports/record-validation-panel";
import {
  ReportSummary,
} from "@/components/reports/report-summary";
import { buildClinicalReportRows } from "@/lib/report-data-join";
import {
  formatComorbidities,
  formatDlqiChangeDisplay,
  formatMultiTherapy,
  DISEASE_ACTIVITY_LABELS,
  IBD_TYPE_LABELS,
} from "@/lib/report-labels";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui/core";

export function ClinicalDatasetPatientTab({ patient }: { patient: Patient }) {
  const {
    clinicalDatasetRecords,
    updateClinicalDatasetRecord,
    upsertClinicalDatasetForPatient,
    patients,
  } = useDemoStore();
  const existing = clinicalDatasetRecords.find(
    (r) => r.patientId === patient.id,
  );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ClinicalDatasetRecord | null>(null);

  const row = useMemo(
    () =>
      buildClinicalReportRows(patients, clinicalDatasetRecords).find(
        (r) => r.patientId === patient.id,
      ),
    [patients, clinicalDatasetRecords, patient.id],
  );

  const issues = existing
    ? validateClinicalDatasetRecord(existing, patient, clinicalDatasetRecords)
    : [];

  const startEdit = () => {
    setDraft(
      existing ?? {
        id: `CDR-${patient.id}`,
        patientId: patient.id,
        ibdCode: patient.ibdCode ?? `IBD-${patient.id}`,
        comorbidities: [],
        modifiers: [],
        currentTherapies: [],
        skinManifestations: [],
        nutritionalDeficiencies: [],
        therapyAdverseEffects: [],
        extraintestinalManifestations: [],
        recordStatus: "incomplete",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    );
    setEditing(true);
  };

  const save = () => {
    if (!draft) return;
    const updated: ClinicalDatasetRecord = {
      ...draft,
      ibdCode: patient.ibdCode ?? draft.ibdCode,
      updatedAt: new Date().toISOString(),
    };
    if (existing) updateClinicalDatasetRecord(updated);
    else upsertClinicalDatasetForPatient(patient.id, updated.ibdCode, updated);
    toast.success("Clinical dataset record saved");
    setEditing(false);
  };

  if (!row && !editing) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">
          No clinical dataset record is linked to this patient yet.
        </p>
        <Button className="mt-4" onClick={startEdit}>
          Create clinical dataset record
        </Button>
      </Card>
    );
  }

  if (editing && draft) {
    return (
      <Card className="space-y-4 p-6">
        <h3 className="text-sm font-bold">Edit clinical dataset</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="IBD type">
            <Select
              className="w-full"
              value={draft.ibdType ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  ibdType: e.target.value
                    ? (Number(e.target.value) as 1 | 2 | 3)
                    : undefined,
                })
              }
            >
              <option value="">Not recorded</option>
              <option value="1">Ulcerative Colitis</option>
              <option value="2">Crohn&apos;s Disease</option>
              <option value="3">IBD-Unclassified</option>
            </Select>
          </Field>
          <Field label="Disease activity">
            <Select
              className="w-full"
              value={draft.diseaseActivity ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  diseaseActivity: e.target.value
                    ? (Number(e.target.value) as 1 | 2)
                    : undefined,
                })
              }
            >
              <option value="">Not recorded</option>
              <option value="1">Active</option>
              <option value="2">Remission</option>
            </Select>
          </Field>
          <Field label="DLQI at presentation">
            <Input
              type="number"
              min={0}
              max={30}
              value={draft.dlqiAtPresentation ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  dlqiAtPresentation:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="DLQI at follow-up">
            <Input
              type="number"
              min={0}
              max={30}
              value={draft.dlqiAtFollowUp ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  dlqiAtFollowUp:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Skin manifestations (comma-separated)">
            <Textarea
              value={draft.skinManifestations.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  skinManifestations: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
          <Field label="Record status">
            <Select
              className="w-full"
              value={draft.recordStatus}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  recordStatus: e.target.value as ClinicalDatasetRecord["recordStatus"],
                })
              }
            >
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
              <option value="review-required">Review required</option>
            </Select>
          </Field>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button onClick={save}>
            <Check className="size-4" />
            Save record
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Clinical dataset (linked to report)
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Demographics: {patient.name}, age {patient.age}, {patient.gender} ·{" "}
              {patient.ibdCode ?? "No IBD code"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={startEdit}>
              Edit record
            </Button>
            <Link href={`/patients/${patient.id}/report`}>
              <Button size="sm">
                <FileText className="size-4" />
                Generate individual report
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h4 className="text-sm font-bold">Disease profile</h4>
          <ul className="mt-3 space-y-1 text-xs text-slate-700">
            <li>
              IBD type:{" "}
              {row?.ibdType ? IBD_TYPE_LABELS[row.ibdType] : "Not recorded"}
            </li>
            <li>Comorbidity: {row ? formatComorbidities(row) : "—"}</li>
            <li>
              Disease activity:{" "}
              {row?.diseaseActivity
                ? DISEASE_ACTIVITY_LABELS[row.diseaseActivity]
                : "Not recorded"}
              {row?.diseaseActivity !== undefined && (
                <span className="text-slate-500">
                  {" "}
                  · Stored code: {row.diseaseActivity}
                </span>
              )}
            </li>
          </ul>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-bold">Therapy</h4>
          <p className="mt-3 text-xs text-slate-700">
            {row ? formatMultiTherapy(row.currentTherapies) : "Not recorded"}
          </p>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-bold">Dermatological findings</h4>
          <p className="mt-3 text-xs text-slate-700">
            {row?.skinManifestations.length
              ? row.skinManifestations.join(", ")
              : "Not recorded"}
          </p>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-bold">DLQI comparison</h4>
          <p className="mt-3 text-xs text-slate-700">
            Presentation: {row?.dlqiAtPresentation ?? "Not recorded"} · Follow-up:{" "}
            {row?.dlqiAtFollowUp ?? "Not recorded"} · Change:{" "}
            {formatDlqiChangeDisplay(row?.dlqiAtPresentation, row?.dlqiAtFollowUp)}
          </p>
        </Card>
      </div>

      {issues.length > 0 && <RecordValidationPanel issues={issues} />}

      {row && (
        <div>
          <h4 className="mb-2 text-sm font-bold">Cohort context (this patient only)</h4>
          <ReportSummary rows={[row]} />
        </div>
      )}
    </div>
  );
}
