"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  buildImagingFormState,
  imagingFormToRecord,
  type ImagingFormState,
} from "@/lib/imaging-utils";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/core";
import type { ImagingRecord, Visit } from "@/types/clinical";

export function ImagingForm({
  patientId,
  visits,
  onCancel,
  onSave,
}: {
  patientId: string;
  visits: Visit[];
  onCancel: () => void;
  onSave: (record: ImagingRecord) => void;
}) {
  const defaultVisitId = visits[0]?.id ?? "";
  const [form, setForm] = useState<ImagingFormState>(() =>
    buildImagingFormState(defaultVisitId),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof ImagingFormState>(
    key: K,
    value: ImagingFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = "Investigation date is required.";
    if (!form.visitId) next.visitId = "Linked visit is required.";
    if (!form.investigationType)
      next.investigationType = "Investigation type is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(
      imagingFormToRecord(form, patientId, `IMG-${patientId}-${Date.now()}`),
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Field label="Investigation date" required error={errors.date}>
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
          <Field
            label="Investigation type"
            required
            error={errors.investigationType}
          >
            <Input
              type="text"
              value={form.investigationType}
              onChange={(e) => update("investigationType", e.target.value)}
              placeholder="e.g. Chest X-ray, USG abdomen, CT abdomen"
            />
          </Field>
        </div>

        <div className="space-y-4">
          <Field label="Findings">
            <Textarea
              value={form.findings}
              onChange={(e) => update("findings", e.target.value)}
              placeholder="Radiological findings"
            />
          </Field>
          <Field label="Impression">
            <Textarea
              value={form.impression}
              onChange={(e) => update("impression", e.target.value)}
              placeholder="Clinical impression"
            />
          </Field>
          <Field label="Remarks">
            <Textarea
              value={form.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              placeholder="Optional notes"
            />
          </Field>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          One row per imaging study. Chest X-ray, USG abdomen, CT abdomen, or
          other investigations as listed in the workbook.
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white p-5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>
          <Check className="size-4" />
          Save imaging
        </Button>
      </div>
    </div>
  );
}
