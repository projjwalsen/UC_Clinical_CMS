"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  POUCH_BODY_FINDINGS,
  POUCH_SCORE_TYPES,
  YES_NO,
} from "@/data/lookups";
import {
  buildPouchoscopyFormState,
  pouchoscopyFormToRecord,
  type PouchoscopyFormState,
} from "@/lib/pouchoscopy-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { PouchoscopyRecord, Visit } from "@/types/clinical";

const YES_NO_OPTIONS = YES_NO.filter((value) => value !== "Not known");

export function PouchoscopyForm({
  patientId,
  visits,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  onCancel: () => void;
  onSave: (record: PouchoscopyRecord) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<PouchoscopyFormState>(() =>
    buildPouchoscopyFormState(defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof PouchoscopyFormState>(
    key: K,
    value: PouchoscopyFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = "Assessment date is required.";
    if (!form.visitId) next.visitId = "Linked visit is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(
      pouchoscopyFormToRecord(
        form,
        patientId,
        `POUCH-${patientId}-${Date.now()}`,
      ),
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Assessment date" required error={errors.date}>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </Field>
          <Field label="Linked visit" required error={errors.visitId}>
            <Select
              className="w-full"
              value={form.visitId}
              onChange={(e) => update("visitId", e.target.value)}
            >
              <option value="">Select visit</option>
              {visits.map((visit) => (
                <option key={visit.id} value={visit.id}>
                  {visit.id} · {visit.type} · {visit.date}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
          <h3 className="text-sm font-bold text-slate-800">Endoscopic findings</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Cuff findings">
              <Textarea
                value={form.cuffFindings}
                onChange={(e) => update("cuffFindings", e.target.value)}
              />
            </Field>
            <Field label="Body finding">
              <Select
                className="w-full"
                value={form.bodyFinding}
                onChange={(e) => update("bodyFinding", e.target.value)}
              >
                <option value="">Select</option>
                {POUCH_BODY_FINDINGS.map((finding) => (
                  <option key={finding}>{finding}</option>
                ))}
              </Select>
            </Field>
            <Field label="Inlet findings">
              <Textarea
                value={form.inletFindings}
                onChange={(e) => update("inletFindings", e.target.value)}
              />
            </Field>
            <Field label="Tip of pouch findings">
              <Textarea
                value={form.tipOfPouchFindings}
                onChange={(e) => update("tipOfPouchFindings", e.target.value)}
              />
            </Field>
            <Field label="Pre-pouch ileum findings">
              <Textarea
                value={form.prePouchIleumFindings}
                onChange={(e) =>
                  update("prePouchIleumFindings", e.target.value)
                }
              />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
          <h3 className="text-sm font-bold text-slate-800">
            Diagnosis and histology
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Diagnosis">
              <Input
                value={form.diagnosis}
                onChange={(e) => update("diagnosis", e.target.value)}
              />
            </Field>
            <Field label="Acute inflammation">
              <Select
                className="w-full"
                value={form.acuteInflammation}
                onChange={(e) => update("acuteInflammation", e.target.value)}
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
            </Field>
            <Field label="Chronic inflammation">
              <Select
                className="w-full"
                value={form.chronicInflammation}
                onChange={(e) =>
                  update("chronicInflammation", e.target.value)
                }
              >
                <option value="">Select</option>
                {YES_NO_OPTIONS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
            </Field>
            <Field label="Score type">
              <Select
                className="w-full"
                value={form.scoreType}
                onChange={(e) => update("scoreType", e.target.value)}
              >
                <option value="">Select score type</option>
                {POUCH_SCORE_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </Select>
            </Field>
            <Field label="Score value">
              <Input
                type="number"
                min={0}
                step={1}
                value={form.scoreValue}
                onChange={(e) => update("scoreValue", e.target.value)}
                placeholder="Enter when PDAI/PAS scored"
              />
            </Field>
            <Field label="Inference">
              <Input
                value={form.inference}
                onChange={(e) => update("inference", e.target.value)}
              />
            </Field>
          </div>
        </section>

        <Field label="Remarks">
          <Textarea
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
            placeholder="Optional notes"
          />
        </Field>

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          One row per pouchoscopy or pouch histology assessment, linked to the
          selected visit.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save pouchoscopy
        </Button>
      </div>
    </div>
  );
}
